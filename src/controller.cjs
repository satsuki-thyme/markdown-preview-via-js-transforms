'use strict';
const path = require('node:path');
const { discover, validatePair, inputExtensions } = require('./paths.cjs');
const { runTransform, MAX_OUTPUT_BYTES } = require('./runner.cjs');
const STATE_KEY = 'lastSuccess.v1';

function createController(v, context, preview, log) {
  let busy = false;
  let abort;
  let last;
  const saved = context.workspaceState.get(STATE_KEY);
  if (saved && typeof saved.markdown === 'string' && Buffer.byteLength(saved.markdown) <= MAX_OUTPUT_BYTES && Number.isFinite(saved.time) && saved.pair && ['input', 'script', 'root'].every(k => typeof saved.pair[k] === 'string' && path.isAbsolute(saved.pair[k]))) {
    last = saved;
    preview.put(last);
  }
  const info = message => { void v.window.showInformationMessage(message); };
  const report = (error, pair) => {
    log.appendLine(`\n[${new Date().toISOString()}] ${pair ? JSON.stringify(pair) : ''}\n${error.stack || error}`);
    void v.window.showErrorMessage(`MDprev via JSproc: ${error.message}${pair ? `\n入力: ${pair.input}\n処理: ${pair.script}` : ''}`, '診断ログを表示').then(action => { if (action) log.show(true); });
  };
  function trusted() {
    if (!v.workspace.isTrusted) throw new Error('JavaScriptの実行にはワークスペースの信頼が必要です。内容を確認してから、VS Codeのワークスペース信頼を管理してください。');
  }
  function rootFor(input) {
    if (!input || input.scheme !== 'file') throw new Error('ローカルの保存先がある入力ファイルを開いてください。未保存の新規文書・Remote・Webは対象外です。');
    const root = v.workspace.getWorkspaceFolder(input);
    if (!root || root.uri.scheme !== 'file') throw new Error('入力ファイルを含むローカルフォルダをワークスペースとして開いてください。');
    return root;
  }
  async function show(record) {
    const uri = preview.uriFor(record.pair.input);
    await v.workspace.openTextDocument(uri);
    await v.commands.executeCommand('markdown.showLockedPreviewToSide', uri);
    return uri;
  }
  async function lock(operation) {
    if (busy) { info('変換処理の選択または実行中です。完了を待つか「実行中の変換を中断」を使ってください。'); return { status: 'busy' }; }
    busy = true;
    try { return await operation(); }
    catch (error) { report(error); return { status: 'error', message: error.message }; }
    finally { busy = false; }
  }
  async function execute(pair) {
    abort = new AbortController();
    const signal = abort.signal;
    try {
      trusted();
      const inputUri = v.Uri.file(pair.input);
      const root = rootFor(inputUri);
      if (path.resolve(root.uri.fsPath) !== path.resolve(pair.root)) throw new Error('前回のワークスペース構成が変わっています。変換処理を選び直してください。');
      await validatePair(pair);
      const input = await v.workspace.openTextDocument(inputUri);
      // Capture the input now, never in a provider read or a save listener.
      const text = input.getText();
      const dirtyScript = v.workspace.textDocuments.find(d => d.uri.scheme === 'file' && path.resolve(d.uri.fsPath) === path.resolve(pair.script) && d.isDirty);
      if (dirtyScript) info('変換JavaScriptには未保存の編集があります。ディスクに保存済みの版を実行します。');
      const config = v.workspace.getConfiguration('mdprevViaJsproc', inputUri);
      const configuredTimeout = config.get('timeoutMs', 10000);
      const timeoutMs = Number.isInteger(configuredTimeout) && configuredTimeout >= 100 && configuredTimeout <= 300000 ? configuredTimeout : 10000;
      log.appendLine(`\n[${new Date().toISOString()}] 実行 ${JSON.stringify(pair)} / VS Code ${v.version} / Node ${process.versions.node} / ${timeoutMs}ms`);
      const markdown = await v.window.withProgress({ location: v.ProgressLocation.Notification, title: `MDprev: ${path.basename(pair.script)}`, cancellable: true }, async (_progress, token) => {
        const subscription = token.onCancellationRequested(() => abort?.abort());
        if (token.isCancellationRequested) abort.abort();
        try { return await runTransform({ script: pair.script, text, filePath: pair.input, timeoutMs, signal, onLog: chunk => log.append(chunk) }); }
        finally { subscription.dispose(); }
      });
      if (signal.aborted) return { status: 'cancelled' };
      trusted();
      const record = { pair: { ...pair }, markdown, time: Date.now() };
      // The worker has exited. Cancellation ends before the atomic commit begins.
      abort = undefined;
      // Persist before publishing. A failed persistence leaves the previous result intact.
      await context.workspaceState.update(STATE_KEY, record);
      last = record;
      preview.put(record);
      log.appendLine(`成功: ${Buffer.byteLength(markdown)} bytes`);
      try { await show(record); }
      catch (error) { report(new Error(`変換は成功しましたが標準プレビューを開けませんでした。「前回の結果を再表示」を試してください。\n${error.message}`), pair); }
      return { status: 'success', uri: preview.uriFor(pair.input) };
    } catch (error) {
      if (error.code === 'CANCELLED') { log.appendLine(error.message); info(error.message); return { status: 'cancelled' }; }
      report(error, pair);
      return { status: 'error', message: error.message };
    } finally { abort = undefined; }
  }
  return {
    selectAndRun: () => lock(async () => {
      trusted();
      const inputUri = v.window.activeTextEditor?.document.uri;
      const root = rootFor(inputUri);
      if (!inputExtensions.has(path.extname(inputUri.fsPath).toLowerCase())) throw new Error('入力として .yaml / .yml / .md / .txt を開いてください。');
      const folder = v.workspace.getConfiguration('mdprevViaJsproc', inputUri).get('transformsFolder', 'transforms');
      const scripts = await discover(root.uri.fsPath, folder);
      if (!scripts.length) throw new Error(`変換JavaScriptがありません。${path.join(root.uri.fsPath, folder)} の直下に .js / .cjs / .mjs を置いてください。`);
      const choice = await v.window.showQuickPick(scripts.map(script => ({ label: path.basename(script), description: path.relative(root.uri.fsPath, script), script })), { title: 'MDprev via JSproc — 変換処理を選択', placeHolder: `${path.basename(inputUri.fsPath)} に適用する処理`, ignoreFocusOut: true });
      if (!choice) { info('変換処理の選択をキャンセルしました。前回の結果を保持します。'); return { status: 'cancelled' }; }
      return execute({ root: root.uri.fsPath, input: inputUri.fsPath, script: choice.script });
    }),
    rerun: () => lock(async () => {
      if (!last) throw new Error('成功した変換の記録がありません。「変換処理を選択して実行」を使ってください。');
      return execute(last.pair);
    }),
    reopen: async () => {
      if (!last) { info('表示できる成功結果がありません。まず変換処理を実行してください。'); return; }
      try { await show(last); } catch (error) { report(error); }
    },
    cancel: () => { if (abort) abort.abort(); else info('実行中の変換はありません。選択画面は Esc で閉じられます。'); },
    dispose: () => abort?.abort(),
    // Not registered as commands. Used by isolated unit/integration tests.
    runPair: pair => lock(() => execute(pair)),
    state: () => ({ busy, last })
  };
}
module.exports = { createController, STATE_KEY };
