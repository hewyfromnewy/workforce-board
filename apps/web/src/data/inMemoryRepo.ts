/**
 * In-memory PlannerRepo adapter — the DB-free stand-in.
 *
 * Holds the domain entities in memory, keeps assignments append-only (writes
 * INSERT, never mutate), and mirrors state to localStorage so a refresh keeps
 * the session's edits. This is a throwaway dev adapter: when the Neon egress is
 * open, an ApiPlannerRepo implementing the same interface replaces it with no
 * component changes. localStorage is NOT acceptable as the real persistence
 * (it loses history, §6) — hence the swappable seam.
 */
import type { IsoDate, JobSite, Resource } from '@workforce/shared';
import type { PlannerRepo } from './repo';
import type { BoardData, PlacementInput, WeekData } from './types';
import { buildBoard } from './buildBoard';
import { buildWeek } from './buildWeek';
import { buildCopyPlan, buildCopyWeekPlan, type CopyPlan } from './copyForward';
import { buildLeaveImportPlan, type LeaveImportPlan } from './leaveImport';
import { addDays, format } from 'date-fns';
import { seed, type SeedState } from './seed';

const STORAGE_KEY = 'planner-inmemory-v1';

function todayIso(): IsoDate {
  return new Date().toISOString().slice(0, 10);
}

export class InMemoryPlannerRepo implements PlannerRepo {
  private state: SeedState;

  constructor() {
    this.state = this.load() ?? seed(todayIso());
  }

  private load(): SeedState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SeedState) : null;
    } catch {
      return null;
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      /* ignore quota/availability errors — dev adapter only */
    }
  }

  /** Reset to fresh seed (handy for demos). */
  reset(): void {
    this.state = seed(todayIso());
    this.save();
  }

  async listResources(): Promise<Resource[]> {
    return this.state.resources.filter((r) => r.active);
  }

  async listAllResources(): Promise<Resource[]> {
    return [...this.state.resources];
  }

  async listAllJobSites(): Promise<JobSite[]> {
    return [...this.state.jobSites];
  }

  async getBoard(date: IsoDate): Promise<BoardData> {
    return buildBoard(date, this.state);
  }

  async getWeek(startDate: IsoDate): Promise<WeekData> {
    return buildWeek(startDate, this.state);
  }

  async planCopyDay(fromDate: IsoDate, toDate: IsoDate): Promise<CopyPlan> {
    return buildCopyPlan(this.state, fromDate, toDate);
  }

  async planCopyWeek(fromStart: IsoDate, toStart: IsoDate): Promise<CopyPlan> {
    return buildCopyWeekPlan(this.state, fromStart, toStart);
  }

  async commitCopy(plan: CopyPlan): Promise<void> {
    // Append-only: each copied placement is a new row with a fresh (newer)
    // timestamp so it supersedes whatever was on the target for that slot.
    const base = Date.now();
    plan.adds.forEach((row, i) => {
      this.state.assignments.push({
        id: `a-copy-${base}-${i}`,
        resourceId: row.resourceId,
        date: row.date,
        slot: row.slot,
        destinationType: row.destinationType,
        destinationId: row.destinationId,
        createdAt: new Date(base + i).toISOString(),
      });
    });
    this.save();
  }

  async place(input: PlacementInput): Promise<void> {
    const slot = input.slot ?? 'full';
    // Append-only: a move/placement is a new row that supersedes the previous
    // one for this (resource, date, slot) via the projection — no mutation.
    this.state.assignments.push({
      id: `a-${input.resourceId}-${input.date}-${slot}-${this.state.assignments.length}`,
      resourceId: input.resourceId,
      date: input.date,
      slot,
      destinationType: input.destination.type,
      destinationId:
        input.destination.type === 'job_site' ? input.destination.jobSiteId : null,
      createdAt: new Date().toISOString(),
    });
    this.save();
  }

  async setLeave(resourceId: string, date: IsoDate, onLeave: boolean): Promise<void> {
    this.state.leave = this.state.leave.filter(
      (l) => !(l.resourceId === resourceId && l.date === date),
    );
    if (onLeave) this.state.leave.push({ resourceId, date, source: 'manual' });
    this.save();
  }

  async setLeaveRange(resourceId: string, start: IsoDate, end: IsoDate, onLeave: boolean): Promise<void> {
    const dates: string[] = [];
    let cur = new Date(`${start}T00:00:00`);
    const last = new Date(`${end}T00:00:00`);
    for (let i = 0; i <= 366 && cur <= last; i++) {
      dates.push(format(cur, 'yyyy-MM-dd'));
      cur = addDays(cur, 1);
    }
    const set = new Set(dates);
    this.state.leave = this.state.leave.filter(
      (l) => !(l.resourceId === resourceId && set.has(l.date)),
    );
    if (onLeave) for (const date of dates) this.state.leave.push({ resourceId, date, source: 'manual' });
    this.save();
  }

  async planLeaveImport(text: string): Promise<LeaveImportPlan> {
    return buildLeaveImportPlan(this.state.resources, text);
  }

  async commitLeaveImport(plan: LeaveImportPlan): Promise<void> {
    for (const d of plan.days) {
      const exists = this.state.leave.some((l) => l.resourceId === d.resourceId && l.date === d.date);
      if (!exists) this.state.leave.push({ resourceId: d.resourceId, date: d.date, source: 'import' });
    }
    this.save();
  }

  async addResource(input: Omit<Resource, 'id'>): Promise<Resource> {
    const resource: Resource = { ...input, id: `r-new-${Date.now()}-${this.state.resources.length}` };
    this.state.resources.push(resource);
    this.save();
    return resource;
  }

  async updateResource(id: string, patch: Partial<Omit<Resource, 'id'>>): Promise<void> {
    this.state.resources = this.state.resources.map((r) => (r.id === id ? { ...r, ...patch } : r));
    this.save();
  }

  async addJobSite(input: Omit<JobSite, 'id'>): Promise<JobSite> {
    const site: JobSite = { ...input, id: `js-new-${Date.now()}-${this.state.jobSites.length}` };
    this.state.jobSites.push(site);
    this.save();
    return site;
  }

  async updateJobSite(id: string, patch: Partial<Omit<JobSite, 'id'>>): Promise<void> {
    this.state.jobSites = this.state.jobSites.map((s) => (s.id === id ? { ...s, ...patch } : s));
    this.save();
  }
}
