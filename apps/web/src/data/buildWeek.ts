/**
 * Pure selector: shape raw domain entities into the weekly grid (resources ×
 * N days). Runs the append-only projection per resource-date; leave takes
 * precedence over assignments in the cell (leave is full-day in v1).
 */
import { addDays, format } from 'date-fns';
import type { IsoDate, ResourceType } from '@workforce/shared';
import { projectCurrent } from '@workforce/shared';
import type { SeedState } from './seed';
import type { WeekCell, WeekData, WeekPlacement, WeekRow } from './types';

const TYPE_ORDER: Record<ResourceType, number> = { person: 0, plant: 1, hire: 2, contractor: 3 };

function isoAdd(start: IsoDate, days: number): IsoDate {
  return format(addDays(new Date(`${start}T00:00:00`), days), 'yyyy-MM-dd');
}

export function buildWeek(startDate: IsoDate, state: SeedState, count = 7): WeekData {
  const days: IsoDate[] = Array.from({ length: count }, (_, i) => isoAdd(startDate, i));
  const daySet = new Set(days);
  const siteName = new Map(state.jobSites.map((s) => [s.id, s.name] as const));

  const current = projectCurrent(state.assignments.filter((a) => daySet.has(a.date)));
  const byKey = new Map<string, WeekPlacement[]>();
  for (const p of current) {
    if (p.destinationType === 'unassigned') continue; // free
    const label =
      p.destinationType === 'job_site'
        ? (siteName.get(p.destinationId ?? '') ?? 'Unknown site')
        : p.destinationType === 'training'
          ? 'Training'
          : '';
    const wp: WeekPlacement = {
      slot: p.slot,
      kind: p.destinationType,
      label,
      jobSiteId: p.destinationType === 'job_site' ? p.destinationId ?? undefined : undefined,
    };
    const key = `${p.resourceId}|${p.date}`;
    const list = byKey.get(key);
    if (list) list.push(wp);
    else byKey.set(key, [wp]);
  }

  const onLeave = new Set(
    state.leave.filter((l) => daySet.has(l.date)).map((l) => `${l.resourceId}|${l.date}`),
  );

  const resources = [...state.resources]
    .filter((r) => r.active)
    .sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type] || a.name.localeCompare(b.name));

  const rows: WeekRow[] = resources.map((resource) => {
    const cells: WeekCell[] = days.map((date) => {
      const key = `${resource.id}|${date}`;
      if (onLeave.has(key)) {
        return { date, placements: [{ slot: 'full', kind: 'leave', label: 'Leave' }] };
      }
      // Order half-day placements AM before PM for a stable read.
      const placements = (byKey.get(key) ?? []).slice().sort((x, y) => x.slot.localeCompare(y.slot));
      return { date, placements };
    });
    return { resource, cells };
  });

  return { days, rows };
}
