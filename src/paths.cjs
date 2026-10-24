'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const inputExtensions = new Set(['.yaml', '.yml', '.md', '.txt']);
const scriptExtensions = new Set(['.js', '.cjs', '.mjs']);

function isWithin(root, target) {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

async function ensureInside(root, target) {
  const [realRoot, realTarget] = await Promise.all([fs.realpath(root), fs.realpath(target)]);
  if (!isWithin(realRoot, realTarget)) throw new Error(`ワークスペース外のパスは利用できません: ${target}`);
  return realTarget;
}

async function validatePair(pair) {
  if (!pair || ![pair.root, pair.input, pair.script].every(p => typeof p === 'string' && path.isAbsolute(p))) {
    throw new Error('実行対象の記録が不正です。「変換処理を選択して実行」から選び直してください。');
  }
  if (!inputExtensions.has(path.extname(pair.input).toLowerCase())) throw new Error('入力には .yaml / .yml / .md / .txt を使ってください。');
  if (!scriptExtensions.has(path.extname(pair.script).toLowerCase())) throw new Error('変換処理には .js / .cjs / .mjs を使ってください。');
  for (const target of [pair.input, pair.script]) {
    try {
      await ensureInside(pair.root, target);
      if (!(await fs.stat(target)).isFile()) throw new Error('通常ファイルではありません。');
    } catch (error) { throw new Error(`対象を読み込めません: ${target}\n${error.message}`, { cause: error }); }
  }
}

async function discover(root, folder) {
  if (typeof folder !== 'string' || !folder.trim() || path.isAbsolute(folder)) throw new Error('transformsFolder はワークスペース内の相対フォルダにしてください。');
  const dir = path.resolve(root, folder);
  if (!isWithin(root, dir)) throw new Error('transformsFolder にワークスペース外は指定できません。');
  try { await ensureInside(root, dir); } catch (error) { throw new Error(`変換フォルダを開けません: ${dir}\nフォルダと変換JavaScriptを作成してください。\n${error.message}`); }
  const candidates = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (!(entry.isFile() || entry.isSymbolicLink()) || !scriptExtensions.has(path.extname(entry.name).toLowerCase()) || /\.backup-\d{4}-\d{2}-\d{2}-\d+\./i.test(entry.name)) continue;
    const target = path.join(dir, entry.name);
    await ensureInside(root, target);
    if ((await fs.stat(target)).isFile()) candidates.push(target);
  }
  return candidates.sort((a, b) => a.localeCompare(b));
}

module.exports = { isWithin, ensureInside, validatePair, discover, inputExtensions };
