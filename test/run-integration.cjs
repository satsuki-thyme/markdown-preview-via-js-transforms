'use strict';
const { runTests } = require('@vscode/test-electron');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
(async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'mdpjsp-vscode-'));
  await fs.mkdir(path.join(root, 'transforms'));
  await fs.writeFile(path.join(root, 'input.md'), '# First 🌿');
  await fs.writeFile(path.join(root, 'transforms', 'identity.cjs'), 'module.exports=({text})=>text');
  try {
    await runTests({
      version: process.env.MDPJSP_VSCODE_VERSION || '1.105.1',
      vscodeExecutablePath: process.env.MDPJSP_VSCODE_EXECUTABLE || undefined,
      extensionDevelopmentPath: path.resolve(__dirname, '..'),
      extensionTestsPath: path.join(__dirname, 'integration.cjs'),
      extensionTestsEnv: { MDPJSP_TEST_ROOT: root },
      launchArgs: [root, '--disable-workspace-trust', '--no-sandbox', '--disable-gpu', ...(process.env.MDPJSP_HEADLESS ? ['--ozone-platform=headless'] : [])]
    });
  } finally { await fs.rm(root, { recursive: true, force: true }); }
})().catch(error => { console.error(error); process.exitCode = 1; });
