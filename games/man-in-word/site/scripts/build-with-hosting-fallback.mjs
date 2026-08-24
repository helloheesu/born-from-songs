import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = fileURLToPath(new URL('../', import.meta.url));
const hostingDirectory = path.join(siteRoot, '.openai');
const hostingConfigPath = path.join(hostingDirectory, 'hosting.json');
const executable = path.join(
  siteRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'vinext.cmd' : 'vinext',
);

let createdFallback = false;

try {
  if (!existsSync(hostingConfigPath)) {
    mkdirSync(hostingDirectory, { recursive: true });
    writeFileSync(
      hostingConfigPath,
      `${JSON.stringify({ project_id: 'local-build-only', d1: null, r2: null }, null, 2)}\n`,
    );
    createdFallback = true;
  }

  const result = spawnSync(executable, ['build'], {
    cwd: siteRoot,
    stdio: 'inherit',
  });

  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  if (createdFallback) rmSync(hostingConfigPath, { force: true });
}
