import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
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
