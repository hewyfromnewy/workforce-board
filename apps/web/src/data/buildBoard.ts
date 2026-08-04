/**
 * Pure selector: shape raw domain entities into the daily BoardData the UI
 * renders. Runs the append-only projection to resolve current placements.
 * Reused by the in-memory adapter now and the API adapter later.
 */
import type { IsoDate, Resource, ResourceType } from '@workforce/shared';
import { projectCurrent } from '@workforce/shared';
import type { SeedState } from './seed';
import type { BoardData, Placement, SiteRow } from './types';

const EMPTY_BY_TYPE = (): Record<ResourceType, Placement[]> => ({
  person: [],
  plant: [],
  hire: [],
  contractor: [],
});

export function buildBoard(date: IsoDate, state: SeedState): BoardData {
  const byId = new Map(state.resources.map((r) => [r.id, r] as const));
  const current = projectCurrent(state.assignments.filter((a) => a.date === date));

  const leaveIds = new Set(
    state.leave.filter((l) => l.date === date).map((l) => l.resourceId),
  );

  const rows = new Map<string, SiteRow>();
  for (const site of state.jobSites) {
    if (site.status !== 'active') continue;
    rows.set(site.id, {
      site,
      byType: EMPTY_BY_TYPE(),
      note: state.dayNotes.find((n) => n.jobSiteId === site.id && n.date === date)?.text,
      traffic: state.trafficControl.find((t) => t.jobSiteId === site.id && t.date === date),
    });
  }

  const training: Placement[] = [];
  const placed = new Set<string>();

  for (const p of current) {
    const resource = byId.get(p.resourceId);
    if (!resource || !resource.active) continue;
    if (p.destinationType === 'job_site' && p.destinationId) {
      const row = rows.get(p.destinationId);
      if (row) {
        row.byType[resource.type].push({ resource, slot: p.slot });
        placed.add(resource.id);
      }
    } else if (p.destinationType === 'training') {
      training.push({ resource, slot: p.slot });
      placed.add(resource.id);
    }
    // 'leave'/'unassigned' destinations fall through to the pool / leave list.
  }

  const leave: Resource[] = state.resources.filter((r) => r.active && leaveIds.has(r.id));
  const unassigned: Resource[] = state.resources.filter(
    (r) => r.active && !placed.has(r.id) && !leaveIds.has(r.id),
  );

  return { date, sites: [...rows.values()], leave, training, unassigned };
}
