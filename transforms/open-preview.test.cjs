'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { openStandardPreview, MARKDOWN_PREVIEW_EDITOR } = require('../src/open-preview.cjs');

class TabInputCustom {
  constructor(uri, viewType) { this.uri = uri; this.viewType = viewType; }
}
const uri = text => ({ toString: () => text });
function fixture() {
  const target = uri('markdown-preview-via-js-transforms:/workspace/input.md.js-transforms-preview.md');
  const groups = [{ viewColumn: 1, tabs: [] }];
  const calls = [];
  const v = {
    TabInputCustom, ViewColumn: { Beside: -2 },
    workspace: { openTextDocument: async u => { assert.equal(u.toString(), target.toString()); } },
    window: { tabGroups: { all: groups, activeTabGroup: groups[0] } },
    commands: { async executeCommand(name, resource, editor, options) {
      calls.push({ name, resource, editor, options });
      assert.equal(name, 'vscode.openWith');
      assert.equal(editor, MARKDOWN_PREVIEW_EDITOR);
      const column = options.viewColumn === -2 ? v.window.tabGroups.activeTabGroup.viewColumn + 1 : options.viewColumn;
      let group = groups.find(g => g.viewColumn === column);
      if (!group) { group = { viewColumn: column, tabs: [] }; groups.push(group); }
      let tab = group.tabs.find(t => t.input instanceof TabInputCustom && t.input.uri.toString() === resource.toString() && t.input.viewType === editor);
      if (!tab) { tab = { label: 'preview', input: new TabInputCustom(resource, editor) }; group.tabs.push(tab); }
      v.window.tabGroups.activeTabGroup = group;
    } }
  };
  const count = () => groups.flatMap(g => g.tabs).filter(t => t.input instanceof TabInputCustom && t.input.uri.toString() === target.toString() && t.input.viewType === MARKDOWN_PREVIEW_EDITOR).length;
  return { v, target, groups, calls, count };
}

test('First preview opens beside; repeated preview-focused calls keep one tab and group', async () => {
  const f = fixture();
  await openStandardPreview(f.v, f.target);
  assert.equal(f.calls[0].options.viewColumn, -2);
  const tab = f.groups[1].tabs[0];
  for (let i = 0; i < 5; i++) await openStandardPreview(f.v, f.target);
  assert.equal(f.count(), 1);
  assert.equal(f.groups.length, 2);
  assert.strictEqual(f.groups[1].tabs[0], tab);
  assert(f.calls.slice(1).every(c => c.options.viewColumn === 2 && c.options.preview === false));
});
test('Another active group does not move or duplicate the existing preview', async () => {
  const f = fixture(); await openStandardPreview(f.v, f.target);
  const third = { viewColumn: 3, tabs: [] }; f.groups.push(third); f.v.window.tabGroups.activeTabGroup = third;
  await openStandardPreview(f.v, f.target);
  assert.equal(f.calls.at(-1).options.viewColumn, 2);
  assert.equal(f.count(), 1); assert.equal(f.groups.length, 3);
});
test('A moved or restored tab is found by URI and editor type without cached object identity', async () => {
  const f = fixture();
  f.groups.push({ viewColumn: 4, tabs: [{ input: new TabInputCustom(uri(f.target.toString()), MARKDOWN_PREVIEW_EDITOR) }] });
  await openStandardPreview(f.v, f.target);
  assert.equal(f.calls.at(-1).options.viewColumn, 4);
  const tab = f.groups[1].tabs.pop(); f.groups.push({ viewColumn: 5, tabs: [tab] });
  await openStandardPreview(f.v, f.target);
  assert.equal(f.calls.at(-1).options.viewColumn, 5); assert.equal(f.count(), 1);
});
test('Closing a preview permits one new tab and subsequent reopen reuses it', async () => {
  const f = fixture(); await openStandardPreview(f.v, f.target);
  f.groups[1].tabs.length = 0;
  await openStandardPreview(f.v, f.target);
  assert.equal(f.calls.at(-1).options.viewColumn, -2); assert.equal(f.count(), 1);
  await openStandardPreview(f.v, f.target); assert.equal(f.count(), 1);
});
test('Same tab label, another URI, or another custom editor cannot be mistaken for this result', async () => {
  const f = fixture();
  f.groups[0].tabs.push(
    { label: 'preview', input: new TabInputCustom(uri('markdown-preview-via-js-transforms:/elsewhere/input.md.js-transforms-preview.md'), MARKDOWN_PREVIEW_EDITOR) },
    { label: 'preview', input: new TabInputCustom(f.target, 'another.editor') },
    { label: 'preview', input: { uri: f.target, viewType: MARKDOWN_PREVIEW_EDITOR } }
  );
  await openStandardPreview(f.v, f.target);
  assert.equal(f.calls[0].options.viewColumn, -2); assert.equal(f.count(), 1);
});
