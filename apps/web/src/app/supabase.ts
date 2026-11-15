import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;

export const backendEnabled = Boolean(url);

export const supabase = createClient(url || 'http://localhost', (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'unused');
