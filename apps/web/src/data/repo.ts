/**
 * The data-layer seam. The whole UI depends only on this interface, so the
 * in-memory adapter (now) and a Neon-backed API adapter (once egress is open)
 * are interchangeable with zero component changes.
 *
 * Method shapes mirror the API's read/write split (apps/api/src/db/queries.ts).
 */
import type { IsoDate, Resource } from '@workforce/shared';
import type { BoardData, PlacementInput, WeekData } from './types';
import type { CopyPlan } from './copyForward';

export interface PlannerRepo {
  // Reads
  listResources(): Promise<Resource[]>;
  getBoard(date: IsoDate): Promise<BoardData>;
  getWeek(startDate: IsoDate): Promise<WeekData>;

  // Copy-forward: plan (preview) then commit (append-only)
  planCopyDay(fromDate: IsoDate, toDate: IsoDate): Promise<CopyPlan>;
  planCopyWeek(fromStart: IsoDate, toStart: IsoDate): Promise<CopyPlan>;
  commitCopy(plan: CopyPlan): Promise<void>;

  // Writes (append-only for assignments)
  place(input: PlacementInput): Promise<void>;
  setLeave(resourceId: string, date: IsoDate, onLeave: boolean): Promise<void>;
  addResource(input: Omit<Resource, 'id'>): Promise<Resource>;
}
