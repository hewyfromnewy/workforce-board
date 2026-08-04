/**
 * Local dev server — runs the Hono app on Node with the Neon HTTP driver.
 * Reads DATABASE_URL from apps/api/.env (see .env.example).
 *
 *   pnpm --filter @workforce/api dev
 */
import 'dotenv/config';
import { serve } from '@hono/node-server';
import app from './index';

const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port });
console.log(`Crew & Plant Planner API listening on http://localhost:${port}`);
