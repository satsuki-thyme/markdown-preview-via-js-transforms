'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const pkg = require('../package.json');
const dist = path.join(root, 'dist');
fs.mkdirSync(dist, { recursive: true });
const output = path.join(dist, `${pkg.name}-${pkg.version}.vsix`);
const temporary = path.join(dist, `build-${crypto.randomUUID()}.vsix`);
const vscePackage = require.resolve('@vscode/vsce/package.json');
const vsceManifest = JSON.parse(fs.readFileSync(vscePackage, 'utf8'));
const vsce = path.join(path.dirname(vscePackage), vsceManifest.bin.vsce);
const result = spawnSync(process.execPath, [vsce, 'package', '--no-dependencies', '--out', temporary], { cwd: root, stdio: 'inherit' });
if (result.error || result.status !== 0) throw result.error || new Error(`vsce failed (${result.status}); previous VSIX retained`);
const bytes = fs.readFileSync(temporary);
if (bytes.length < 100 || bytes.readUInt32LE(0) !== 0x04034b50) throw new Error(`Invalid package: ${temporary}`);
if (fs.existsSync(output)) {
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  let n = 1, backup;
  do { backup = path.join(dist, `${pkg.name}-${pkg.version}.backup-${date}-${String(n++).padStart(2, '0')}.vsix`); } while (fs.existsSync(backup));
  const original = fs.readFileSync(output);
  fs.renameSync(output, backup);
  if (!fs.readFileSync(backup).equals(original) || fs.existsSync(output)) throw new Error(`Backup verification failed: ${backup}`);
  console.log(`Previous VSIX renamed: ${path.basename(backup)}`);
}
// Exclusive creation preserves any unexpected concurrent file at the destination.
fs.copyFileSync(temporary, output, fs.constants.COPYFILE_EXCL);
if (!fs.readFileSync(output).equals(bytes)) throw new Error(`Package verification failed; retained: ${output}, ${temporary}`);
fs.unlinkSync(temporary);
console.log(`Package ready: ${output}\nSHA-256: ${crypto.createHash('sha256').update(bytes).digest('hex')}`);
