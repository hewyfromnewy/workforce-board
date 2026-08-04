/**
 * @workforce/api
 * Backend API for the Crew & Plant Planner.
 *
 * Planned stack (see docs/adr/0001-tech-stack.md):
 * - Hono, running on Cloudflare Workers
 * - Neon serverless Postgres, accessed via Drizzle ORM
 * - Read paths kept separable from write paths (§6)
 * - Assignments stored append-only — never overwritten or deleted
 *
 * This is a placeholder until the persistence layer lands (issue #2).
 */

import type { Resource, JobSite, Assignment, LeaveRecord } from '@workforce/shared';

// Placeholder — API implementation coming soon.
console.log('Crew & Plant Planner API — not yet implemented');

export type { Resource, JobSite, Assignment, LeaveRecord };
