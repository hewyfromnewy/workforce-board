/**
 * Neon serverless Postgres + Drizzle client.
 *
 * Uses the Neon HTTP driver (no long-lived connections), which suits Cloudflare
 * Workers as well as local Node. The connection string is read from the
 * environment — never hard-coded (see `.env.example` and ADR 0001). In Workers
 * it comes from the request binding (`c.env.DATABASE_URL`); in local Node dev
 * from `process.env.DATABASE_URL`.
 */
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { schema } from './schema';

export type Db = ReturnType<typeof createDb>;

export function createDb(databaseUrl: string) {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set — see apps/api/.env.example');
  }
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}
