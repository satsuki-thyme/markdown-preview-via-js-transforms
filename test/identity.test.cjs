'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const pkg = require('../package.json');

test('Packaged identity matches activated commands, readonly URI provider and output channel', async () => {
  const names = ['selectAndRun', 'rerun', 'reopenPreview', 'cancel', 'showLog'];
  const prefix = 'markdownPreviewViaJsTransforms';
  const displayName = 'Markdown Preview via JS Transforms';
  assert.equal(`${pkg.publisher}.${pkg.name}`, 'satsuki-thyme.markdown-preview-via-js-transforms');
  assert.equal(pkg.displayName, displayName);
  assert.equal(pkg.contributes.configuration.title, displayName);
  assert.deepEqual(pkg.contributes.commands.map(c => c.command), names.map(n => `${prefix}.${n}`));
  assert(pkg.contributes.commands.every(c => c.category === displayName));
  assert.deepEqual(Object.keys(pkg.contributes.configuration.properties), [`${prefix}.transformsFolder`, `${prefix}.timeoutMs`]);
  assert.deepEqual(pkg.capabilities.untrustedWorkspaces.restrictedConfigurations, [`${prefix}.transformsFolder`]);
  const commands = new Map(), providers = [], reads = [], notices = [];
  let channel;
  const disposable = () => ({ dispose() {} });
  const v = {
    ExtensionMode: { Production: 1 },
    EventEmitter: class { event = () => disposable(); fire() {} dispose() {} },
    workspace: { registerFileSystemProvider(scheme, provider, options) { providers.push({ scheme, provider, options }); return disposable(); } },
    window: {
      createOutputChannel(name) { channel = name; return { ...disposable(), append() {}, appendLine() {}, show() {} }; },
      showInformationMessage(message) { notices.push(message); return Promise.resolve(); }
    },
    commands: { registerCommand(name, handler) { assert(!commands.has(name)); commands.set(name, handler); return disposable(); } }
  };
  const context = { extensionMode: 1, subscriptions: [], workspaceState: {
    get(key) { reads.push(key); return undefined; },
    update() { throw new Error('Activation/reopen must not write or execute a conversion'); }
  } };
  const exposed = {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/extension.cjs'), 'utf8'), {
    exports: exposed, process,
    require: id => id === 'vscode' ? v : require(path.join(__dirname, '../src', id))
  });
  assert.equal(exposed.activate(context), undefined);
  assert.equal(channel, displayName);
  assert.deepEqual([...commands.keys()], names.map(n => `${prefix}.${n}`));
  assert.equal(providers.length, 1);
  assert.equal(providers[0].scheme, 'markdown-preview-via-js-transforms');
  assert.equal(providers[0].options.isReadonly, true);
  assert.deepEqual(pkg.activationEvents, [`onFileSystem:${providers[0].scheme}`]);
  assert.deepEqual(reads, [`${prefix}.lastSuccess.v1`]);
  await commands.get(`${prefix}.reopenPreview`)();
  assert(notices.some(message => message.includes('表示できる成功結果がありません')));
  for (const item of context.subscriptions) item.dispose();
});
