/**
 * Data access, split into `reads` and `writes` to keep read paths separable
 * from write paths (spec §6). The web app's read-only screens only ever touch
 * `reads`; only editor actions touch `writes`.
 */
import { and, eq, gte, lte, inArray } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
import type { Db } from './client';
import {
  assignments,
  dayNotes,
  jobSites,
  leaveRecords,
  resources,
  trafficControl,
} from './schema';

export type AssignmentRow = InferSelectModel<typeof assignments>;

// ---------------------------------------------------------------------------
// Append-only projection: resolve the current placement(s) for a resource-date
// ---------------------------------------------------------------------------

/**
 * Given the latest assignment row per slot for a single resource on a single
 * date, return the current placement(s).
 *
 * Rule: the current decision is the most recent *action*. A full-day placement
 * and a split (AM/PM) are distinct actions, compared by `createdAt`:
 *  - full-day newer than (or without) any half → the day is `full`;
 *  - otherwise the day is split into whichever halves were set after the full.
 * If only one half was placed after a full-day, the other half is treated as
 * unassigned (splitting is an explicit, deliberate action).
 *
 * Pure and exported for unit testing.
 */
export function currentPlacements(latestPerSlot: AssignmentRow[]): AssignmentRow[] {
  const ts = (r?: AssignmentRow) => (r ? new Date(r.createdAt).getTime() : -Infinity);
  const full = latestPerSlot.find((r) => r.slot === 'full');
  const am = latestPerSlot.find((r) => r.slot === 'am');
  const pm = latestPerSlot.find((r) => r.slot === 'pm');

  const fullTs = ts(full);
  const halfMax = Math.max(ts(am), ts(pm));
  if (full && fullTs >= halfMax) return [full];

  const out: AssignmentRow[] = [];
  if (am && ts(am) > fullTs) out.push(am);
  if (pm && ts(pm) > fullTs) out.push(pm);
  return out;
}

/** Reduce a flat list of assignment rows to the current placements per resource-date. */
function projectCurrent(rows: AssignmentRow[]): AssignmentRow[] {
  // Newest first, so the first row seen per (resource,date,slot) is the latest.
  const sorted = [...rows].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const latestPerSlot = new Map<string, AssignmentRow>();
  for (const r of sorted) {
    const key = `${r.resourceId}|${r.date}|${r.slot}`;
    if (!latestPerSlot.has(key)) latestPerSlot.set(key, r);
  }
  // Group latest-per-slot by resource-date, then reconcile full vs split.
  const byResourceDate = new Map<string, AssignmentRow[]>();
  for (const r of latestPerSlot.values()) {
    const key = `${r.resourceId}|${r.date}`;
    (byResourceDate.get(key) ?? byResourceDate.set(key, []).get(key)!).push(r);
  }
  return [...byResourceDate.values()].flatMap(currentPlacements);
}

// ---------------------------------------------------------------------------
// Reads (read path)
// ---------------------------------------------------------------------------

export const reads = {
  activeResources: (db: Db) =>
    db.select().from(resources).where(eq(resources.active, true)),

  jobSites: (db: Db) => db.select().from(jobSites),

  /** Current daily board: reconciled assignments + notes + traffic for one date. */
  async board(db: Db, date: string) {
    const [rawAssignments, notes, traffic, leave] = await Promise.all([
      db.select().from(assignments).where(eq(assignments.date, date)),
      db.select().from(dayNotes).where(eq(dayNotes.date, date)),
      db.select().from(trafficControl).where(eq(trafficControl.date, date)),
      db.select().from(leaveRecords).where(eq(leaveRecords.date, date)),
    ]);
    return {
      date,
      assignments: projectCurrent(rawAssignments),
      dayNotes: notes,
      trafficControl: traffic,
      leave,
    };
  },

  /** Weekly grid: current placements per resource across [startDate, endDate]. */
  async week(db: Db, startDate: string, endDate: string) {
    const rawAssignments = await db
      .select()
      .from(assignments)
      .where(and(gte(assignments.date, startDate), lte(assignments.date, endDate)));
    const leave = await db
      .select()
      .from(leaveRecords)
      .where(and(gte(leaveRecords.date, startDate), lte(leaveRecords.date, endDate)));
    return { startDate, endDate, assignments: projectCurrent(rawAssignments), leave };
  },
};

// ---------------------------------------------------------------------------
// Writes (write path)
// ---------------------------------------------------------------------------

export interface NewAssignment {
  resourceId: string;
  date: string;
  slot?: 'full' | 'am' | 'pm';
  destinationType: 'job_site' | 'leave' | 'training' | 'unassigned';
  destinationId?: string | null;
}

export const writes = {
  /**
   * Place or move a resource — always an append-only INSERT. Because the read
   * projection takes the latest row per (resource, date, slot), inserting a new
   * placement automatically supersedes the previous one: a resource can never be
   * in two places for the same slot in the current view (clash prevention, §4.4).
   */
  placeAssignment: (db: Db, a: NewAssignment) =>
    db
      .insert(assignments)
      .values({
        resourceId: a.resourceId,
        date: a.date,
        slot: a.slot ?? 'full',
        destinationType: a.destinationType,
        destinationId: a.destinationId ?? null,
      })
      .returning(),

  upsertDayNote: (db: Db, jobSiteId: string, date: string, text: string) =>
    db
      .insert(dayNotes)
      .values({ jobSiteId, date, text })
      .onConflictDoUpdate({ target: [dayNotes.jobSiteId, dayNotes.date], set: { text } }),

  upsertTrafficControl: (
    db: Db,
    jobSiteId: string,
    date: string,
    count: number,
    provider: string,
  ) =>
    db
      .insert(trafficControl)
      .values({ jobSiteId, date, count, provider })
      .onConflictDoUpdate({
        target: [trafficControl.jobSiteId, trafficControl.date],
        set: { count, provider },
      }),

  /** Full-day leave for a date range (§4.8). Idempotent per (resource, date). */
  setLeave: (
    db: Db,
    entries: { resourceId: string; date: string; source?: 'manual' | 'import' }[],
  ) =>
    db
      .insert(leaveRecords)
      .values(entries.map((e) => ({ ...e, source: e.source ?? 'manual' })))
      .onConflictDoNothing(),

  clearLeave: (db: Db, resourceId: string, dates: string[]) =>
    db
      .delete(leaveRecords)
      .where(and(eq(leaveRecords.resourceId, resourceId), inArray(leaveRecords.date, dates))),
};
