/**
 * Copy-forward (§4.5): replicate a day's (or week's) current placements onto
 * another day, respecting the target's leave and training — never overwriting
 * them. Pure plan builder; committing just appends the rows (append-only, §6).
 */
import { addDays, format } from 'date-fns';
import type { AssignmentSlot, DestinationType, IsoDate } from '@workforce/shared';
import { projectCurrent } from '@workforce/shared';
import type { SeedState } from './seed';

export interface CopyRow {
  resourceId: string;
  resourceName: string;
  date: IsoDate;
  slot: AssignmentSlot;
  destinationType: DestinationType;
  destinationId: string | null;
  destLabel: string;
}

export interface CopySkip {
  resourceId: string;
  resourceName: string;
  reason: 'leave' | 'training';
}

export interface CopyPlan {
  fromDate: IsoDate;
  toDate: IsoDate;
  days: number;
  adds: CopyRow[];
  skipped: CopySkip[];
}

const isoAdd = (d: IsoDate, n: number): IsoDate =>
  format(addDays(new Date(`${d}T00:00:00`), n), 'yyyy-MM-dd');

/** Plan copying one day's placements onto another day. */
export function buildCopyPlan(state: SeedState, fromDate: IsoDate, toDate: IsoDate): CopyPlan {
  const byId = new Map(state.resources.map((r) => [r.id, r] as const));
  const siteName = new Map(state.jobSites.map((s) => [s.id, s.name] as const));

  const src = projectCurrent(state.assignments.filter((a) => a.date === fromDate));
  const tgt = projectCurrent(state.assignments.filter((a) => a.date === toDate));
  const tgtLeave = new Set(state.leave.filter((l) => l.date === toDate).map((l) => l.resourceId));
  const tgtTraining = new Set(
    tgt.filter((p) => p.destinationType === 'training').map((p) => p.resourceId),
  );

  const adds: CopyRow[] = [];
  const skipped: CopySkip[] = [];

  for (const p of src) {
    if (p.destinationType !== 'job_site' && p.destinationType !== 'training') continue;
    const r = byId.get(p.resourceId);
    if (!r || !r.active) continue;
    if (tgtLeave.has(r.id)) {
      skipped.push({ resourceId: r.id, resourceName: r.name, reason: 'leave' });
      continue;
    }
    if (tgtTraining.has(r.id)) {
      skipped.push({ resourceId: r.id, resourceName: r.name, reason: 'training' });
      continue;
    }
    adds.push({
      resourceId: r.id,
      resourceName: r.name,
      date: toDate,
      slot: p.slot,
      destinationType: p.destinationType,
      destinationId: p.destinationId,
      destLabel:
        p.destinationType === 'training'
          ? 'Training'
          : siteName.get(p.destinationId ?? '') ?? 'Unknown site',
    });
  }
  return { fromDate, toDate, days: 1, adds, skipped };
}

/** Plan copying a week (count days) onto another week. */
export function buildCopyWeekPlan(
  state: SeedState,
  fromStart: IsoDate,
  toStart: IsoDate,
  count = 7,
): CopyPlan {
  const adds: CopyRow[] = [];
  const skipped: CopySkip[] = [];
  for (let i = 0; i < count; i++) {
    const day = buildCopyPlan(state, isoAdd(fromStart, i), isoAdd(toStart, i));
    adds.push(...day.adds);
    skipped.push(...day.skipped);
  }
  return { fromDate: fromStart, toDate: toStart, days: count, adds, skipped };
}
