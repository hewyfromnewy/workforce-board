/**
 * @workforce/api — Crew & Plant Planner API.
 *
 * Hono app, deployed to Cloudflare Workers (see wrangler.toml) and runnable
 * locally via `src/dev-server.ts`. Reads and writes are mounted on separate
 * routers to keep the paths separable (spec §6). The Neon connection string is
 * read from the environment per request — never hard-coded (ADR 0001).
 */
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createDb, type Db } from './db/client';
import { reads, writes, type NewAssignment } from './db/queries';

export interface Env {
  DATABASE_URL: string;
}

type Vars = { db: Db };

const app = new Hono<{ Bindings: Env; Variables: Vars }>();

app.use('*', cors());

// Resolve the DB from Workers bindings (c.env) or local Node (process.env).
app.use('*', async (c, next) => {
  const fromNode =
    typeof process !== 'undefined' ? process.env?.DATABASE_URL : undefined;
  const url = c.env?.DATABASE_URL ?? fromNode ?? '';
  c.set('db', createDb(url));
  await next();
});

app.get('/health', (c) => c.json({ ok: true }));

// --- Read path (read-only screens) ----------------------------------------
const read = new Hono<{ Bindings: Env; Variables: Vars }>();
read.get('/resources', async (c) => c.json(await reads.activeResources(c.get('db'))));
read.get('/job-sites', async (c) => c.json(await reads.jobSites(c.get('db'))));
read.get('/board/:date', async (c) => c.json(await reads.board(c.get('db'), c.req.param('date'))));
read.get('/week', async (c) => {
  const start = c.req.query('start');
  const end = c.req.query('end');
  if (!start || !end) return c.json({ error: 'start and end query params required' }, 400);
  return c.json(await reads.week(c.get('db'), start, end));
});

// --- Write path (editor actions) ------------------------------------------
const write = new Hono<{ Bindings: Env; Variables: Vars }>();
write.post('/assignments', async (c) => {
  const body = (await c.req.json()) as NewAssignment;
  return c.json(await writes.placeAssignment(c.get('db'), body));
});
write.post('/leave', async (c) => {
  const body = (await c.req.json()) as {
    entries: { resourceId: string; date: string; source?: 'manual' | 'import' }[];
  };
  return c.json(await writes.setLeave(c.get('db'), body.entries));
});
// TODO(#7): day-note + traffic-control endpoints. TODO(#11): resource/job-site CRUD.

app.route('/api', read);
app.route('/api', write);

export default app;
