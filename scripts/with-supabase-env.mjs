import { spawn } from 'node:child_process';
import { supabaseEnv } from './supabase-env.mjs';

const [command, ...args] = process.argv.slice(2);

const child = spawn(command, args, {
  stdio: 'inherit',
  env: { ...process.env, ...supabaseEnv() },
});

child.on('exit', code => process.exit(code ?? 1));
