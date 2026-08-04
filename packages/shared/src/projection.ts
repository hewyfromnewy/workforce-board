/**
 * Append-only assignment projection.
 *
 * The `assignments` store is insert-only (§6). "Current" state for a resource on
 * a date is derived here, not stored. Shared by the API (server) and the web
 * in-memory adapter (client) so both resolve history identically.
 */
import type { Assignment } from './domain';

const ts = (r?: Assignment) => (r ? new Date(r.createdAt).getTime() : -Infinity);

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
 */
export function currentPlacements(latestPerSlot: Assignment[]): Assignment[] {
  const full = latestPerSlot.find((r) => r.slot === 'full');
  const am = latestPerSlot.find((r) => r.slot === 'am');
  const pm = latestPerSlot.find((r) => r.slot === 'pm');

  const fullTs = ts(full);
  const halfMax = Math.max(ts(am), ts(pm));
  if (full && fullTs >= halfMax) return [full];

  const out: Assignment[] = [];
  if (am && ts(am) > fullTs) out.push(am);
  if (pm && ts(pm) > fullTs) out.push(pm);
  return out;
}

/** Reduce a flat list of assignment rows to the current placements per resource-date. */
export function projectCurrent(rows: Assignment[]): Assignment[] {
  const sorted = [...rows].sort((a, b) => ts(b) - ts(a)); // newest first
  const latestPerSlot = new Map<string, Assignment>();
  for (const r of sorted) {
    const key = `${r.resourceId}|${r.date}|${r.slot}`;
    if (!latestPerSlot.has(key)) latestPerSlot.set(key, r);
  }
  const byResourceDate = new Map<string, Assignment[]>();
  for (const r of latestPerSlot.values()) {
    const key = `${r.resourceId}|${r.date}`;
    const list = byResourceDate.get(key);
    if (list) list.push(r);
    else byResourceDate.set(key, [r]);
  }
  return [...byResourceDate.values()].flatMap(currentPlacements);
}
