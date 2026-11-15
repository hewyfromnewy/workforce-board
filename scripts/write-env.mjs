import { writeFileSync } from 'node:fs';
import { supabaseEnv } from './supabase-env.mjs';

writeFileSync('.env', `SUPABASE_ANON_KEY=${supabaseEnv().VITE_SUPABASE_ANON_KEY}\n`);
