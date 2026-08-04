/**
 * Provides the active PlannerRepo to the component tree and a `useBoard` hook.
 * Swap the adapter here (in-memory ↔ API) without touching any component.
 */
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { IsoDate } from '@workforce/shared';
import type { PlannerRepo } from './repo';
import type { BoardData, PlacementInput } from './types';
import { InMemoryPlannerRepo } from './inMemoryRepo';

const RepoContext = createContext<PlannerRepo | null>(null);

export function RepoProvider({ children }: { children: React.ReactNode }) {
  const repo = useMemo(() => new InMemoryPlannerRepo(), []);
  return <RepoContext.Provider value={repo}>{children}</RepoContext.Provider>;
}

export function useRepo(): PlannerRepo {
  const repo = useContext(RepoContext);
  if (!repo) throw new Error('useRepo must be used within <RepoProvider>');
  return repo;
}

export function useBoard(date: IsoDate) {
  const repo = useRepo();
  const [board, setBoard] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  // Track the latest date requested so an in-flight load can't overwrite a newer one.
  const latest = useRef(date);

  async function refresh() {
    const forDate = latest.current;
    const data = await repo.getBoard(forDate);
    if (latest.current === forDate) setBoard(data);
  }

  useEffect(() => {
    latest.current = date;
    setLoading(true);
    repo.getBoard(date).then((data) => {
      if (latest.current === date) {
        setBoard(data);
        setLoading(false);
      }
    });
  }, [repo, date]);

  async function place(input: PlacementInput) {
    await repo.place(input);
    await refresh();
  }

  async function placeAtSite(resourceId: string, jobSiteId: string) {
    await place({ resourceId, date: latest.current, destination: { type: 'job_site', jobSiteId } });
  }

  async function sendTo(resourceId: string, type: 'training' | 'unassigned') {
    await place({ resourceId, date: latest.current, destination: { type } });
  }

  async function setLeave(resourceId: string, onLeave: boolean) {
    await repo.setLeave(resourceId, latest.current, onLeave);
    await refresh();
  }

  return { board, loading, place, placeAtSite, sendTo, setLeave, refresh };
}
