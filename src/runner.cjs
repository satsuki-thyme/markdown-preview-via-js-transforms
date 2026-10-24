'use strict';
const { Worker } = require('node:worker_threads');
const path = require('node:path');
const MAX_OUTPUT_BYTES = 16 * 1024 * 1024;
const fault = (message, code) => Object.assign(new Error(message), { code });

function runTransform({ script, text, filePath, timeoutMs = 10000, signal, onLog = () => {} }) {
  if (signal?.aborted) return Promise.reject(fault('変換を中断しました。', 'CANCELLED'));
  return new Promise((resolve, reject) => {
    let worker;
    try {
      worker = new Worker(path.join(__dirname, 'worker.cjs'), {
        workerData: { script, text, filePath, maxOutputBytes: MAX_OUTPUT_BYTES },
        stdout: true, stderr: true, execArgv: [],
        resourceLimits: { maxOldGenerationSizeMb: 256 }
      });
    } catch (error) { reject(error); return; }
    let finishing = false;
    let logBytes = 0;
    const log = chunk => {
      if (logBytes < 65536) {
        try { onLog(chunk.subarray(0, 65536 - logBytes).toString('utf8')); } catch { /* Logging must not stop cleanup. */ }
      }
      logBytes += chunk.length;
    };
    worker.stdout.on('data', log);
    worker.stderr.on('data', log);
    const finish = async (error, markdown) => {
      if (finishing) return;
      finishing = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', cancel);
      try { await worker.terminate(); }
      catch (stopError) { reject(stopError); return; }
      // Never resolve until the actual worker has exited.
      if (error) reject(error); else resolve(markdown);
    };
    const cancel = () => { void finish(fault('変換を中断しました。前回の結果を保持します。', 'CANCELLED')); };
    const timer = setTimeout(() => { void finish(fault(`変換が制限時間 ${timeoutMs} ms を超えたため停止しました。`, 'TIMEOUT')); }, timeoutMs);
    signal?.addEventListener('abort', cancel, { once: true });
    if (signal?.aborted) cancel();
    worker.on('message', message => {
      if (message?.ok === true && typeof message.markdown === 'string' && Buffer.byteLength(message.markdown) <= MAX_OUTPUT_BYTES) void finish(null, message.markdown);
      else {
        const error = new Error(message?.message || '変換処理から不正な応答を受信しました。');
        if (message?.stack) error.stack = message.stack;
        void finish(error);
      }
    });
    worker.on('error', error => { void finish(error); });
    worker.on('exit', code => { if (!finishing) void finish(new Error(`変換結果を返さず実行環境が終了しました（exit ${code}）。`)); });
  });
}
module.exports = { runTransform, MAX_OUTPUT_BYTES };
