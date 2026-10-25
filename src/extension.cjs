'use strict';
const vscode = require('vscode');
const { DISPLAY_NAME, NAMESPACE, PREVIEW_SCHEME } = require('./identity.cjs');
const { createPreviewStore } = require('./preview.cjs');
const { createController } = require('./controller.cjs');

exports.activate = context => {
  const log = vscode.window.createOutputChannel(DISPLAY_NAME);
  const preview = createPreviewStore(vscode);
  const controller = createController(vscode, context, preview, log);
  context.subscriptions.push(log, preview, controller,
    vscode.workspace.registerFileSystemProvider(PREVIEW_SCHEME, preview.provider, { isReadonly: true, isCaseSensitive: process.platform === 'linux' }));
  const commands = {
    selectAndRun: controller.selectAndRun, rerun: controller.rerun,
    reopenPreview: controller.reopen, cancel: controller.cancel, showLog: () => log.show(true)
  };
  for (const [name, handler] of Object.entries(commands)) context.subscriptions.push(vscode.commands.registerCommand(`${NAMESPACE}.${name}`, handler));
  if (context.extensionMode !== vscode.ExtensionMode.Production) return { controller, preview };
};
