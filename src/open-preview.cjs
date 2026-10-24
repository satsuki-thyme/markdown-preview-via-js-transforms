'use strict';

// VS Code's built-in Markdown Preview custom editor. It is bound to its URI,
// unlike the dynamic preview's active-editor tracking mode.
const MARKDOWN_PREVIEW_EDITOR = 'vscode.markdown.preview.editor';

async function openStandardPreview(vscode, uri) {
  await vscode.workspace.openTextDocument(uri);
  let viewColumn = vscode.ViewColumn.Beside;
  for (const group of vscode.window.tabGroups.all) {
    if (group.tabs.some(tab => tab.input instanceof vscode.TabInputCustom
      && tab.input.viewType === MARKDOWN_PREVIEW_EDITOR
      && tab.input.uri.toString() === uri.toString())) {
      viewColumn = group.viewColumn;
      break;
    }
  }
  // Reuse the target's existing editor group even when its preview, another
  // group, or a terminal has focus. Only a missing preview opens to the side.
  await vscode.commands.executeCommand('vscode.openWith', uri, MARKDOWN_PREVIEW_EDITOR, {
    viewColumn,
    preview: false
  });
}

module.exports = { openStandardPreview, MARKDOWN_PREVIEW_EDITOR };
