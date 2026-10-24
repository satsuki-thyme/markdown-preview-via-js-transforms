'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { EventEmitter: NodeEmitter } = require('node:events');
const { discover, isWithin } = require('../src/paths.cjs');
const { createPreviewStore } = require('../src/preview.cjs');
const { createController } = require('../src/controller.cjs');
class Uri {
  constructor(scheme, p) { this.scheme = scheme; this.path = p; this.fsPath = p; }
  with(o) { return new Uri(o.scheme ?? this.scheme, o.path ?? this.path); }
  toString() { return `${this.scheme}:${this.path}`; }
  static file(p) { return new Uri('file', p); }
}
class Disposable { constructor(fn = () => {}) { this.dispose = fn; } }
class Emitter {
  constructor() { this.e = new NodeEmitter(); this.event = f => { this.e.on('change', f); return new Disposable(() => this.e.off('change', f)); }; }
  fire(data) { this.e.emit('change', data); }
  dispose() { this.e.removeAllListeners(); }
}
async function setup(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'mdpjsp-controller-'));
  t.after(() => fs.rm(root, { force: true, recursive: true }));
  await fs.mkdir(path.join(root, 'transforms'));
  const input = path.join(root, 'input.md'), script = path.join(root, 'transforms', 'identity.cjs');
  await fs.writeFile(input, 'saved'); await fs.writeFile(script, 'module.exports=({text})=>text');
  const data = new Map(), dirty = new Map(), notices = [], commands = [], docs = [];
  const state = { failSave: false, selection: 0, timeout: 10000, roots: [root] };
  const v = {
    Uri, Disposable, EventEmitter: Emitter, FileType: { File: 1 }, FileChangeType: { Changed: 1, Created: 2 },
    FileSystemError: { NoPermissions: () => new Error('readonly'), FileNotFound: () => new Error('missing') },
    ProgressLocation: { Notification: 1 }, version: 'mock',
    commands: { executeCommand: async (...args) => commands.push(args) },
    workspace: {
      isTrusted: true, textDocuments: docs,
      getWorkspaceFolder: uri => { const found = state.roots.find(r => isWithin(r, uri.fsPath)); return found ? { uri: Uri.file(found) } : undefined; },
      getConfiguration: () => ({ get: (key, fallback) => key === 'timeoutMs' ? state.timeout : fallback }),
      openTextDocument: async uri => ({ uri, getText: () => dirty.get(uri.fsPath) ?? require('node:fs').readFileSync(uri.fsPath, 'utf8') }),
      fs: { readFile: uri => fs.readFile(uri.fsPath), stat: uri => fs.stat(uri.fsPath), readDirectory: async () => [] }
    },
    window: {
      activeTextEditor: { document: { uri: Uri.file(input) } },
      showInformationMessage: async message => notices.push(message),
      showErrorMessage: async message => { notices.push(message); },
      showQuickPick: async choices => state.selection === null ? undefined : choices[state.selection],
      withProgress: async (_options, fn) => fn({}, { isCancellationRequested: false, onCancellationRequested: () => new Disposable() })
    }
  };
  const context = { workspaceState: { get: key => data.get(key), update: async (key, value) => { if (state.failSave) throw Error('state write failed'); data.set(key, value); } } };
  const preview = createPreviewStore(v), events = [];
  preview.provider.onDidChangeFile(e => events.push(e));
  // Provider opening uses only a snapshot; text input uses the fake document above.
  const originalOpen = v.workspace.openTextDocument;
  v.workspace.openTextDocument = async uri => uri.scheme === 'mdpjsp' ? { uri, getText: () => '' } : originalOpen(uri);
  const log = { append() {}, appendLine() {}, show() {} };
  const controller = createController(v, context, preview, log);
  return { root, input, script, pair: { root, input, script }, v, state, dirty, docs, notices, commands, context, preview, events, controller, log };
}
test('Four input extensions + dirty input are read without rewriting originals', async t => {
  const s = await setup(t);
  for (const ext of ['yaml', 'yml', 'md', 'txt']) {
    const input = path.join(s.root, `日本語.${ext}`); await fs.writeFile(input, 'original'); s.dirty.set(input, '未保存 🌿');
    assert.equal((await s.controller.runPair({ ...s.pair, input })).status, 'success');
    assert.equal(s.controller.state().last.markdown, '未保存 🌿');
    assert.equal(await fs.readFile(input, 'utf8'), 'original');
  }
});
test('Manual success is stable across input/script saves and provider/reopen reads', async t => {
  const s = await setup(t);
  assert.equal((await s.controller.selectAndRun()).status, 'success');
  const uri = s.preview.uriFor(s.input), count = s.events.length;
  await fs.writeFile(s.input, 'new saved input'); await fs.writeFile(s.script, 'module.exports=({text})=>text+" changed script"');
  s.v.window.activeTextEditor = undefined;
  await s.controller.reopen();
  assert.equal((await s.preview.provider.readFile(uri)).toString(), 'saved');
  assert.equal(s.events.length, count);
  assert.equal((await s.controller.rerun()).status, 'success');
  assert.equal(s.controller.state().last.markdown, 'new saved input changed script');
});
test('Dirty script executes saved bytes and explicitly informs user', async t => {
  const s = await setup(t);
  s.docs.push({ uri: Uri.file(s.script), isDirty: true, getText: () => 'throw Error("unsaved")' });
  assert.equal((await s.controller.runPair(s.pair)).status, 'success');
  assert(s.notices.some(x => x.includes('保存済み')));
});
test('Failures, missing targets and persistence error retain result AND pair', async t => {
  const s = await setup(t);
  await s.controller.runPair(s.pair);
  const last = s.controller.state().last;
  const bad = path.join(s.root, 'transforms', 'bad.cjs');
  await fs.writeFile(bad, 'module.exports=()=>99');
  assert.equal((await s.controller.runPair({ ...s.pair, script: bad })).status, 'error');
  assert.strictEqual(s.controller.state().last, last);
  await fs.unlink(s.input);
  assert.equal((await s.controller.rerun()).status, 'error');
  assert.strictEqual(s.controller.state().last, last);
  await fs.writeFile(s.input, 'updated'); s.state.failSave = true;
  assert.equal((await s.controller.rerun()).status, 'error');
  assert.equal((await s.preview.provider.readFile(s.preview.uriFor(s.input))).toString(), 'saved');
});
test('Trust check, absent workspace and absent last record prevent execution', async t => {
  const s = await setup(t);
  assert.equal((await s.controller.rerun()).status, 'error');
  s.v.workspace.isTrusted = false;
  assert.equal((await s.controller.runPair(s.pair)).status, 'error');
  assert.equal(s.controller.state().last, undefined);
  s.v.workspace.isTrusted = true; s.state.roots = [];
  assert.equal((await s.controller.runPair(s.pair)).status, 'error');
});
test('No candidates, cancelled selection and initial error never become empty success', async t => {
  const s = await setup(t);
  s.state.selection = null;
  assert.equal((await s.controller.selectAndRun()).status, 'cancelled');
  assert.equal(s.controller.state().last, undefined);
  await fs.unlink(s.script); s.state.selection = 0;
  assert.equal((await s.controller.selectAndRun()).status, 'error');
  assert.equal(s.controller.state().last, undefined);
});
test('Only direct JS modules are candidates; backups, helpers, outside paths excluded', async t => {
  const s = await setup(t);
  await fs.mkdir(path.join(s.root, 'transforms', 'lib'));
  await fs.writeFile(path.join(s.root, 'transforms', 'a.backup-2026-10-24-01.js'), '');
  await fs.writeFile(path.join(s.root, 'transforms', 'lib', 'helper.js'), '');
  await fs.writeFile(path.join(s.root, 'transforms', 'b.mjs'), '');
  assert.equal((await discover(s.root, 'transforms')).length, 2);
  await assert.rejects(discover(s.root, '../'));
  await assert.rejects(discover(s.root, s.root));
  const outside = await fs.mkdtemp(path.join(os.tmpdir(), 'mdpjsp-outside-'));
  t.after(() => fs.rm(outside, { recursive: true, force: true }));
  await fs.symlink(outside, path.join(s.root, 'outside'));
  await assert.rejects(discover(s.root, 'outside'));
});
test('Concurrent requests are refused, cancel kills active job, old success persists', async t => {
  const s = await setup(t); await s.controller.runPair(s.pair);
  await fs.writeFile(s.script, 'module.exports=()=>{while(true){}}');
  const active = s.controller.rerun();
  assert.equal((await s.controller.rerun()).status, 'busy');
  setTimeout(() => s.controller.cancel(), 80);
  assert.equal((await active).status, 'cancelled');
  assert.equal(s.controller.state().last.markdown, 'saved');
  assert.equal(s.controller.state().busy, false);
});
test('Restored success renders without executing missing script; resource proxy is readonly', async t => {
  const s = await setup(t); await s.controller.runPair(s.pair); await fs.unlink(s.script);
  const preview = createPreviewStore(s.v);
  const restored = createController(s.v, s.context, preview, s.log);
  await restored.reopen();
  assert.equal((await preview.provider.readFile(preview.uriFor(s.input))).toString(), 'saved');
  const asset = path.join(s.root, 'image.png'); const bytes = Buffer.from([0, 1, 255]); await fs.writeFile(asset, bytes);
  assert.deepEqual(await preview.provider.readFile(Uri.file(asset).with({ scheme: 'mdpjsp' })), bytes);
  assert.throws(() => preview.provider.writeFile(), /readonly/);
  await assert.rejects(preview.provider.readFile(Uri.file('/outside.png').with({ scheme: 'mdpjsp' })));
});
test('Multi-root selection uses input root; rerun ignores another active file', async t => {
  const s = await setup(t);
  const second = await fs.mkdtemp(path.join(os.tmpdir(), 'mdpjsp-second-'));
  t.after(() => fs.rm(second, { recursive: true, force: true }));
  s.state.roots.push(second); await fs.mkdir(path.join(second, 'transforms'));
  const input = path.join(second, 'other.txt'), script = path.join(second, 'transforms', 'other.cjs');
  await fs.writeFile(input, 'second'); await fs.writeFile(script, 'module.exports=({text})=>text');
  s.v.window.activeTextEditor = { document: { uri: Uri.file(input) } };
  assert.equal((await s.controller.selectAndRun()).status, 'success');
  s.v.window.activeTextEditor = { document: { uri: Uri.file(s.input) } };
  assert.equal((await s.controller.rerun()).status, 'success');
  assert.equal(s.controller.state().last.pair.root, second);
  assert.equal(s.controller.state().last.markdown, 'second');
});
