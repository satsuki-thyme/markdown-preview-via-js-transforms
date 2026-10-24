'use strict';
const vscode = require('vscode');
const { createPreviewStore } = require('./preview.cjs');
const { createController } = require('./controller.cjs');

exports.activate = context => {
  const log = vscode.window.createOutputChannel('MDprev via JSproc');
  const preview = createPreviewStore(vscode);
  const controller = createController(vscode, context, preview, log);
  context.subscriptions.push(log, preview, controller,
    vscode.workspace.registerFileSystemProvider('mdpjsp', preview.provider, { isReadonly: true, isCaseSensitive: process.platform === 'linux' }));
  const commands = {
    selectAndRun: controller.selectAndRun, rerun: controller.rerun,
    reopenPreview: controller.reopen, cancel: controller.cancel, showLog: () => log.show(true)
  };
  for (const [name, handler] of Object.entries(commands)) context.subscriptions.push(vscode.commands.registerCommand(`mdprevViaJsproc.${name}`, handler));
  if (context.extensionMode !== vscode.ExtensionMode.Production) return { controller, preview };
};
