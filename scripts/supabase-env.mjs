import { execFileSync } from 'node:child_process';

export function supabaseEnv() {
  const status = execFileSync('pnpm', ['exec', 'supabase', 'status', '-o', 'env'], { encoding: 'utf8' });
  const vars = Object.fromEntries(
    status
      .split('\n')
      .filter(line => line.includes('='))
      .map(line => {
        const i = line.indexOf('=');
        return [line.slice(0, i), line.slice(i + 1).replace(/^"|"$/g, '')];
      }),
  );
  return {
    VITE_SUPABASE_URL: vars.API_URL,
    VITE_SUPABASE_ANON_KEY: vars.ANON_KEY ?? vars.PUBLISHABLE_KEY,
  };
}
