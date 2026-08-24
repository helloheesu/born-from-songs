import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = fileURLToPath(new URL('../', import.meta.url));
const webRoot = fileURLToPath(new URL('../../web/', import.meta.url));
const webDist = path.join(webRoot, 'dist');
const publicGame = path.join(siteRoot, 'public', 'game');
const npmExecutable = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const result = spawnSync(npmExecutable, ['run', 'build'], {
  cwd: webRoot,
  stdio: 'inherit',
});

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

rmSync(publicGame, { recursive: true, force: true });
mkdirSync(path.dirname(publicGame), { recursive: true });
cpSync(webDist, publicGame, { recursive: true });
