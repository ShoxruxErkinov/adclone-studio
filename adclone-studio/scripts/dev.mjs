import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
for (const file of ['.env.local', '.env']) if (existsSync(file)) process.loadEnvFile(file);
const mode = process.argv.includes('--production') ? 'start' : 'dev';
const children = [
  spawn(process.execPath, [path.resolve('node_modules/next/dist/bin/next'), mode, '--hostname', '127.0.0.1', '--port', process.env.PORT || '3000'], { stdio: 'inherit' }),
  spawn(process.execPath, [path.resolve('node_modules/tsx/dist/cli.mjs'), 'scripts/worker.ts'], { stdio: 'inherit' }),
];
let stopping = false;
function stop(code = 0) { if (stopping) return; stopping = true; for (const child of children) child.kill(); process.exitCode = code; }
process.on('SIGINT', () => stop()); process.on('SIGTERM', () => stop());
for (const child of children) child.on('exit', code => stop(code ?? 1));
