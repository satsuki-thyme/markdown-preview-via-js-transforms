'use strict';
const { parentPort, workerData } = require('node:worker_threads');
const { pathToFileURL } = require('node:url');
// Keep an unresolved Promise alive so the parent can distinguish it from exit().
const keepAlive = setInterval(() => {}, 1000);
(async () => {
  try {
    const loaded = await import(pathToFileURL(workerData.script).href);
    const transform = loaded.default;
    if (typeof transform !== 'function') throw new TypeError('module.exports または export default で変換関数を公開してください。');
    const result = await transform({ text: workerData.text, filePath: workerData.filePath });
    if (typeof result !== 'string') throw new TypeError(`戻り値はMarkdown文字列にしてください（実際: ${result === null ? 'null' : typeof result}）。`);
    if (Buffer.byteLength(result, 'utf8') > workerData.maxOutputBytes) throw new RangeError('変換結果が16 MiBを超えています。出力を小さくしてください。');
    parentPort.postMessage({ ok: true, markdown: result });
  } catch (error) {
    parentPort.postMessage({ ok: false, message: String(error?.message ?? error).slice(0, 16384), stack: String(error?.stack ?? '').slice(0, 32768) });
  } finally { clearInterval(keepAlive); }
})();
