import { execFileSync, spawn } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function stopFrontendOnPort(port) {
  if (process.platform !== 'win32') {
    return;
  }

  const output = execFileSync('netstat.exe', ['-ano', '-p', 'tcp'], { encoding: 'utf8' });
  const listener = output
    .split(/\r?\n/)
    .find((line) => line.includes(`:${port}`) && line.includes('LISTENING'));

  if (!listener) {
    return;
  }

  const processId = listener.trim().split(/\s+/).at(-1);
  if (!processId || !/^\d+$/.test(processId)) {
    throw new Error(`Could not determine the process listening on port ${port}.`);
  }

  execFileSync('taskkill.exe', ['/PID', processId, '/T', '/F'], { stdio: 'inherit' });
}

stopFrontendOnPort(3001);

const nextDir = join(root, '.next-dev');
if (existsSync(nextDir)) {
  rmSync(nextDir, { recursive: true, force: true });
  console.log('Removed .next-dev cache');
}

const nextCli = join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
const child = spawn(process.execPath, [nextCli, 'dev', '-p', '3001'], {
  cwd: root,
  stdio: 'inherit',
  env: {
    ...process.env,
    STORYHOP_NEXT_DIST_DIR: '.next-dev',
  },
});

child.on('exit', (code) => process.exit(code ?? 0));
