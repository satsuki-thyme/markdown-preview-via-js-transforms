'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { runTransform } = require('../src/runner.cjs');
async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'markdown-preview-via-js-transforms-runner-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  return root;
}
test('CommonJS / ESM / async receive exact Unicode text and absolute path', async t => {
  const root = await fixture(t);
  for (const [name, code] of [
    ['a.cjs', 'module.exports=async ({text,filePath})=>text+"|"+filePath'],
    ['b.mjs', 'export default async ({text,filePath})=>text+"|"+filePath'],
    ['c.js', 'module.exports=({text,filePath})=>Promise.resolve(text+"|"+filePath)']
  ]) {
    const script = path.join(root, name); await fs.writeFile(script, code);
    assert.equal(await runTransform({ script, text: '日本語\r\n🌿', filePath: path.join(root, '入力.yml') }), `日本語\r\n🌿|${path.join(root, '入力.yml')}`);
  }
});
test('Fresh worker reloads script and transitive CommonJS / ESM dependencies', async t => {
  const root = await fixture(t);
  for (const ext of ['cjs', 'mjs']) {
    const dep = path.join(root, `dep.${ext}`), script = path.join(root, `main.${ext}`);
    await fs.writeFile(dep, ext === 'cjs' ? 'module.exports="first"' : 'export default "first"');
    await fs.writeFile(script, ext === 'cjs' ? 'module.exports=()=>require("./dep.cjs")' : 'import value from "./dep.mjs"; export default ()=>value');
    assert.equal(await runTransform({ script, text: '', filePath: '' }), 'first');
    await fs.writeFile(dep, ext === 'cjs' ? 'module.exports="second"' : 'export default "second"');
    assert.equal(await runTransform({ script, text: '', filePath: '' }), 'second');
    await fs.writeFile(script, ext === 'cjs' ? 'module.exports=()=>"third"' : 'export default ()=>"third"');
    assert.equal(await runTransform({ script, text: '', filePath: '' }), 'third');
  }
});
test('npm package resolves from transform workspace, without extension dependencies', async t => {
  const root = await fixture(t);
  await fs.mkdir(path.join(root, 'node_modules', 'fixture-package'), { recursive: true });
  await fs.writeFile(path.join(root, 'node_modules', 'fixture-package', 'index.js'), 'module.exports="workspace package"');
  await fs.mkdir(path.join(root, 'transforms'));
  const script = path.join(root, 'transforms', 'main.cjs');
  await fs.writeFile(script, 'module.exports=()=>require("fixture-package")');
  assert.equal(await runTransform({ script, text: '', filePath: '' }), 'workspace package');
});
test('Syntax, thrown/rejected exception, non-string, missing export/file and early exit fail', async t => {
  const root = await fixture(t), script = path.join(root, 'bad.cjs');
  for (const code of ['module.exports = (', 'module.exports=()=>{throw Error("boom")}', 'module.exports=async()=>{throw Error("rejected")}', 'module.exports=()=>42', 'module.exports=()=>null', 'module.exports={}', 'process.exit(0)', 'module.exports=()=>"a".repeat(17*1024*1024)']) {
    await fs.writeFile(script, code);
    await assert.rejects(runTransform({ script, text: '', filePath: '', timeoutMs: 1500 }));
  }
  await assert.rejects(runTransform({ script: path.join(root, 'missing.js'), text: '', filePath: '' }));
});
test('Timeout kills synchronous infinite loop and never-resolving Promise; retry works', async t => {
  const root = await fixture(t), script = path.join(root, 'hang.cjs');
  for (const code of ['module.exports=()=>{while(true){}}', 'module.exports=()=>new Promise(()=>{})']) {
    await fs.writeFile(script, code);
    const marker = path.join(root, 'started');
    await fs.writeFile(script, `require('node:fs').writeFileSync(${JSON.stringify(marker)},'started');` + code);
    const started = Date.now();
    await assert.rejects(runTransform({ script, text: '', filePath: '', timeoutMs: 1200 }), { code: 'TIMEOUT' });
    assert.equal(await fs.readFile(marker, 'utf8'), 'started');
    assert(Date.now() - started < 5000);
    await fs.unlink(marker);
  }
  await fs.writeFile(script, 'module.exports=()=>"retry"');
  assert.equal(await runTransform({ script, text: '', filePath: '' }), 'retry');
});
test('Cancellation terminates worker activity, and success cleans up remaining timers', async t => {
  const root = await fixture(t), script = path.join(root, 'timer.cjs'), marker = path.join(root, 'marker');
  await fs.writeFile(script, `const fs=require('node:fs');module.exports=()=>{console.log('START');setInterval(()=>fs.appendFileSync(${JSON.stringify(marker)},'x'),10);return new Promise(()=>{});}`);
  const controller = new AbortController();
  let sawStart = false;
  const running = runTransform({ script, text: '', filePath: '', signal: controller.signal, timeoutMs: 5000, onLog: chunk => { if (!sawStart && chunk.includes('START')) { sawStart = true; setTimeout(() => controller.abort(), 100); } } });
  await assert.rejects(running, { code: 'CANCELLED' });
  assert(sawStart);
  const before = await fs.readFile(marker, 'utf8');
  assert(before.length > 0);
  await new Promise(r => setTimeout(r, 80));
  assert.equal(await fs.readFile(marker, 'utf8').catch(() => ''), before);
  await fs.writeFile(script, 'module.exports=()=>{setInterval(()=>{},1000);return "ok"}');
  assert.equal(await runTransform({ script, text: '', filePath: '' }), 'ok');
});
test('Empty string is valid and console output is bounded', async t => {
  const root = await fixture(t), script = path.join(root, 'log.cjs');
  await fs.writeFile(script, 'module.exports=()=>{console.log("x".repeat(100000));return ""}');
  let logs = '';
  assert.equal(await runTransform({ script, text: '', filePath: '', onLog: c => { logs += c; } }), '');
  assert(logs.length <= 65536);
});
