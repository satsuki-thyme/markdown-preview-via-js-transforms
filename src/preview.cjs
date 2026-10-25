'use strict';
const { ensureInside } = require('./paths.cjs');
const { PREVIEW_SCHEME, PREVIEW_SUFFIX } = require('./identity.cjs');

function createPreviewStore(vscode) {
  const snapshots = new Map();
  const changed = new vscode.EventEmitter();
  const key = uri => uri.with({ query: '', fragment: '' }).toString();
  const uriFor = input => vscode.Uri.file(input).with({ scheme: PREVIEW_SCHEME, path: `${vscode.Uri.file(input).path}${PREVIEW_SUFFIX}` });
  const denied = () => { throw vscode.FileSystemError.NoPermissions('変換プレビューは読み取り専用です。'); };
  async function underlying(uri) {
    const target = uri.with({ scheme: 'file', query: '', fragment: '' });
    const root = vscode.workspace.getWorkspaceFolder(target);
    if (!root || root.uri.scheme !== 'file') throw vscode.FileSystemError.NoPermissions(uri);
    try { await ensureInside(root.uri.fsPath, target.fsPath); }
    catch { throw vscode.FileSystemError.FileNotFound(uri); }
    return target;
  }
  const provider = {
    onDidChangeFile: changed.event,
    watch: () => new vscode.Disposable(() => {}),
    async stat(uri) {
      const item = snapshots.get(key(uri));
      return item ? { type: vscode.FileType.File, ctime: item.time, mtime: item.time, size: Buffer.byteLength(item.markdown) } : vscode.workspace.fs.stat(await underlying(uri));
    },
    async readFile(uri) {
      const item = snapshots.get(key(uri));
      return item ? Buffer.from(item.markdown, 'utf8') : vscode.workspace.fs.readFile(await underlying(uri));
    },
    async readDirectory(uri) { return vscode.workspace.fs.readDirectory(await underlying(uri)); },
    createDirectory: denied, writeFile: denied, delete: denied, rename: denied
  };
  return {
    provider, uriFor,
    put(record) {
      const uri = uriFor(record.pair.input);
      const exists = snapshots.has(key(uri));
      snapshots.set(key(uri), { markdown: record.markdown, time: record.time });
      changed.fire([{ type: exists ? vscode.FileChangeType.Changed : vscode.FileChangeType.Created, uri }]);
      return uri;
    },
    dispose() { changed.dispose(); snapshots.clear(); }
  };
}
module.exports = { createPreviewStore };
