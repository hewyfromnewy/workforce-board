/**
 * Drizzle schema — mirrors the v1 domain model in
 * `packages/shared/src/domain.ts` (spec §3). TypeScript camelCase maps to
 * snake_case columns here.
 *
 * Append-only rule (§6): the `assignments` table is insert-only — rows are
 * never updated or deleted. A move/change inserts a new row; the read layer
 * resolves the latest decision per resource-date (see `queries.ts`). The other
 * per-day tables (day notes, traffic control, leave) are simple current-state
 * tables, since only assignment history feeds costings.
 */
import {
  pgEnum,
  pgTable,
  text,
  boolean,
  numeric,
  integer,
  date,
  timestamp,
  uuid,
  primaryKey,
  index,
} from 'drizzle-orm/pg-core';

export const resourceType = pgEnum('resource_type', [
  'person',
  'plant',
  'hire',
  'contractor',
]);
export const jobSiteStatus = pgEnum('job_site_status', ['active', 'complete']);
export const assignmentSlot = pgEnum('assignment_slot', ['full', 'am', 'pm']);
export const destinationType = pgEnum('destination_type', [
  'job_site',
  'leave',
  'training',
  'unassigned',
]);
export const leaveSource = pgEnum('leave_source', ['manual', 'import']);

export const resources = pgTable('resources', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  type: resourceType('type').notNull(),
  crew: text('crew').notNull().default('road-construction'),
  /** Nullable, unused in v1 (§6 costings). numeric maps to string in Drizzle. */
  rate: numeric('rate'),
  /** Soft-delete flag — never hard-delete. */
  active: boolean('active').notNull().default(true),
});

export const jobSites = pgTable('job_sites', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  jobNumber: text('job_number').notNull(),
  crew: text('crew').notNull().default('road-construction'),
  startDate: date('start_date', { mode: 'string' }),
  endDate: date('end_date', { mode: 'string' }),
  status: jobSiteStatus('status').notNull().default('active'),
});

/**
 * Append-only assignment log. One row per placement/move; never mutated.
 * Current state = latest row per (resource_id, date, slot), reconciled for
 * full-vs-split in the read layer. The `(resource_id, date, created_at)` index
 * serves that projection.
 */
export const assignments = pgTable(
  'assignments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    resourceId: uuid('resource_id')
      .notNull()
      .references(() => resources.id),
    date: date('date', { mode: 'string' }).notNull(),
    slot: assignmentSlot('slot').notNull().default('full'),
    destinationType: destinationType('destination_type').notNull(),
    /** JobSite id when destinationType = 'job_site', else null. */
    destinationId: uuid('destination_id').references(() => jobSites.id),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    byResourceDate: index('assignments_resource_date_idx').on(
      t.resourceId,
      t.date,
      t.createdAt,
    ),
    byDate: index('assignments_date_idx').on(t.date),
  }),
);

export const dayNotes = pgTable(
  'day_notes',
  {
    jobSiteId: uuid('job_site_id')
      .notNull()
      .references(() => jobSites.id),
    date: date('date', { mode: 'string' }).notNull(),
    text: text('text').notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.jobSiteId, t.date] }) }),
);

export const trafficControl = pgTable(
  'traffic_control',
  {
    jobSiteId: uuid('job_site_id')
      .notNull()
      .references(() => jobSites.id),
    date: date('date', { mode: 'string' }).notNull(),
    count: integer('count').notNull(),
    provider: text('provider').notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.jobSiteId, t.date] }) }),
);

/** Full-day only in v1 — no slot (half-day leave is a future extension). */
export const leaveRecords = pgTable(
  'leave_records',
  {
    resourceId: uuid('resource_id')
      .notNull()
      .references(() => resources.id),
    date: date('date', { mode: 'string' }).notNull(),
    source: leaveSource('source').notNull().default('manual'),
  },
  (t) => ({ pk: primaryKey({ columns: [t.resourceId, t.date] }) }),
);

export const schema = {
  resources,
  jobSites,
  assignments,
  dayNotes,
  trafficControl,
  leaveRecords,
};
