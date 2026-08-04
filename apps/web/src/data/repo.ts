/**
 * The data-layer seam. The whole UI depends only on this interface, so the
 * in-memory adapter (now) and a Neon-backed API adapter (once egress is open)
 * are interchangeable with zero component changes.
 *
 * Method shapes mirror the API's read/write split (apps/api/src/db/queries.ts).
 */
import type { IsoDate, JobSite, Resource } from '@workforce/shared';
import type { BoardData, PlacementInput, WeekData } from './types';
import type { CopyPlan } from './copyForward';
import type { LeaveImportPlan } from './leaveImport';

export interface PlannerRepo {
  // Reads
  listResources(): Promise<Resource[]>; // active only
  getBoard(date: IsoDate): Promise<BoardData>;
  getWeek(startDate: IsoDate): Promise<WeekData>;

  // Master-data reads (include inactive/complete, for the manage panel)
  listAllResources(): Promise<Resource[]>;
  listAllJobSites(): Promise<JobSite[]>;

  // Copy-forward: plan (preview) then commit (append-only)
  planCopyDay(fromDate: IsoDate, toDate: IsoDate): Promise<CopyPlan>;
  planCopyWeek(fromStart: IsoDate, toStart: IsoDate): Promise<CopyPlan>;
  commitCopy(plan: CopyPlan): Promise<void>;

  // Writes (append-only for assignments)
  place(input: PlacementInput): Promise<void>;
  setLeave(resourceId: string, date: IsoDate, onLeave: boolean): Promise<void>;

  // Leave (full-day, §4.8): date range + bulk/CSV import (plan then commit)
  setLeaveRange(resourceId: string, start: IsoDate, end: IsoDate, onLeave: boolean): Promise<void>;
  planLeaveImport(text: string): Promise<LeaveImportPlan>;
  commitLeaveImport(plan: LeaveImportPlan): Promise<void>;

  // Master-data CRUD (never hard-delete — active flag / complete status only, §3/§6)
  addResource(input: Omit<Resource, 'id'>): Promise<Resource>;
  updateResource(id: string, patch: Partial<Omit<Resource, 'id'>>): Promise<void>;
  addJobSite(input: Omit<JobSite, 'id'>): Promise<JobSite>;
  updateJobSite(id: string, patch: Partial<Omit<JobSite, 'id'>>): Promise<void>;
}
