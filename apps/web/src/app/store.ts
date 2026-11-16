import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { noteKey } from '@workforce/shared';
import type { Job, RosterDay, RosterStatus, SentRecord, Tag, TagType } from '@workforce/shared';

export interface Store {
  orgName: string;
  tags: Tag[];
  jobs: Job[];
  days: Record<string, RosterDay>;
}

export interface HistoryEntry {
  date: string;
  sent: SentRecord;
}

export interface BulkResult {
  added: number;
  skipped: number;
}

export interface StoreApi {
  store: Store;
  loading: boolean;
  history: HistoryEntry[];
  getDay: (date: string) => RosterDay;
  dayLoaded: (date: string) => boolean;
  loadDay: (date: string) => void;
  loadHistory: () => void;
  assign: (date: string, tagId: string, categoryId: string, jobId: string) => void;
  setSupervisor: (date: string, tagId: string) => void;
  crew: (date: string, tagId: string, assetId: string) => void;
  unassign: (date: string, tagId: string) => void;
  setNote: (date: string, jobId: string, categoryId: string, text: string) => void;
  markSent: (date: string) => void;
  addTag: (name: string, type: TagType) => 'added' | 'duplicate';
  addTags: (names: string[], type: TagType) => BulkResult;
  removeTag: (id: string) => () => void;
  addJob: (name: string, jobNumber: string) => 'added' | 'duplicate';
  addJobs: (lines: string[]) => BulkResult;
  updateJob: (id: string, change: Partial<Omit<Job, 'id'>>) => void;
  removeJob: (id: string) => () => void;
  copyDay: (from: string, to: string) => Promise<void>;
  setOrgName: (name: string) => void;
  resetAll: () => void;
}

const demoTags: Tag[] = [
  { id: 'm1', name: 'John Smith', type: 'member' },
  { id: 'm2', name: 'Sarah Johnson', type: 'member' },
  { id: 'm3', name: 'Mike Davis', type: 'member' },
  { id: 'm4', name: 'Emma Wilson', type: 'member' },
  { id: 'm5', name: 'Chris Brown', type: 'member' },
  { id: 'm6', name: 'Lisa Anderson', type: 'member' },
  { id: 'a1', name: 'Excavator #1', type: 'asset' },
  { id: 'a2', name: 'Truck #23', type: 'asset' },
  { id: 'a3', name: 'Roller #8', type: 'asset' },
  { id: 'h1', name: 'Hire Excavator', type: 'hire' },
  { id: 'h2', name: 'Traffic Control Crew', type: 'hire' },
];

const demoJobs: Job[] = [
  { id: 'j1', name: 'North Depot', jobNumber: '', note: '' },
  { id: 'j2', name: 'River Road', jobNumber: '', note: '' },
  { id: 'j3', name: 'Park Street', jobNumber: '', note: '' },
  { id: 'j4', name: 'Stockpile', jobNumber: '', note: '' },
];

export const initialStore: Store = {
  orgName: 'Your organisation',
  tags: demoTags,
  jobs: demoJobs,
  days: {},
};

export const dayKey = (date: Date) => format(date, 'yyyy-MM-dd');

export const emptyDay = (date: string): RosterDay => ({
  date,
  assignments: [],
  notes: {},
  supervisorIds: [],
});

type Plan = Pick<RosterDay, 'assignments' | 'notes' | 'supervisorIds'>;

export const signature = (plan: Plan) =>
  JSON.stringify([
    plan.assignments.map(a => `${a.tagId}|${a.categoryId}|${a.jobId}|${a.onTagId ?? ''}`).sort(),
    Object.entries(plan.notes).filter(([, text]) => text !== '').map(([k, text]) => `${k}=${text}`).sort(),
    [...plan.supervisorIds].sort(),
  ]);

export const statusOf = (day: RosterDay): RosterStatus => {
  if (!day.sent) return 'draft';
  return signature(day.sent) === signature(day) ? 'sent' : 'changed';
};

export const dayOf = (store: Store, date: string): RosterDay => store.days[date] ?? emptyDay(date);

const withDay = (store: Store, date: string, change: (day: RosterDay) => RosterDay): Store => ({
  ...store,
  days: { ...store.days, [date]: change(dayOf(store, date)) },
});

export const assignTo = (store: Store, date: string, tagId: string, categoryId: string, jobId: string) =>
  withDay(store, date, day => ({
    ...day,
    supervisorIds: day.supervisorIds.filter(id => id !== tagId),
    assignments: [
      ...day.assignments.filter(a => a.tagId !== tagId).map(a => (a.onTagId === tagId ? { ...a, categoryId, jobId } : a)),
      { tagId, categoryId, jobId },
    ],
  }));

export const crewTo = (store: Store, date: string, tagId: string, assetId: string) =>
  withDay(store, date, day => {
    const asset = day.assignments.find(a => a.tagId === assetId)!;
    return {
      ...day,
      supervisorIds: day.supervisorIds.filter(id => id !== tagId),
      assignments: [
        ...day.assignments.filter(a => a.tagId !== tagId),
        { tagId, categoryId: asset.categoryId, jobId: asset.jobId, onTagId: assetId },
      ],
    };
  });

export const unassignFrom = (store: Store, date: string, tagId: string) =>
  withDay(store, date, day => ({
    ...day,
    supervisorIds: day.supervisorIds.filter(id => id !== tagId),
    assignments: day.assignments.filter(a => a.tagId !== tagId && a.onTagId !== tagId),
  }));

export const supervisorOn = (store: Store, date: string, tagId: string) =>
  withDay(store, date, day => ({
    ...day,
    assignments: day.assignments.filter(a => a.tagId !== tagId),
    supervisorIds: [...day.supervisorIds.filter(id => id !== tagId), tagId],
  }));

export const noteOn = (store: Store, date: string, jobId: string, categoryId: string, text: string) =>
  withDay(store, date, day => {
    const { [noteKey(jobId, categoryId)]: _removed, ...rest } = day.notes;
    return { ...day, notes: text === '' ? rest : { ...rest, [noteKey(jobId, categoryId)]: text } };
  });

export const copiedFrom = (store: Store, from: string, to: string) => {
  const source = dayOf(store, from);
  return withDay(store, to, day => ({
    ...day,
    assignments: source.assignments,
    notes: source.notes,
    supervisorIds: source.supervisorIds,
  }));
};

export const sentOn = (store: Store, date: string, sent: SentRecord) =>
  withDay(store, date, day => ({ ...day, sent }));

export const snapshotOf = (day: RosterDay): Omit<SentRecord, 'at'> => ({
  assignments: day.assignments,
  notes: day.notes,
  supervisorIds: day.supervisorIds,
});

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export function tagsAdded(store: Store, names: string[], type: TagType, makeId: () => string) {
  const added: Tag[] = [];
  let skipped = 0;
  names
    .map(n => n.trim())
    .filter(n => n !== '')
    .forEach(name => {
      const duplicate =
        type !== 'hire' && [...store.tags, ...added].some(t => t.type === type && sameName(t.name, name));
      if (duplicate) {
        skipped += 1;
        return;
      }
      added.push({ id: makeId(), name, type });
    });
  return { added, skipped };
}

export const parseJobLine = (line: string) => {
  const cut = line.lastIndexOf(',');
  if (cut === -1) return { name: line.trim(), jobNumber: '' };
  return { name: line.slice(0, cut).trim(), jobNumber: line.slice(cut + 1).trim() };
};

export function jobsAdded(store: Store, entries: { name: string; jobNumber: string }[], makeId: () => string) {
  const added: Job[] = [];
  let skipped = 0;
  entries
    .filter(e => e.name !== '')
    .forEach(entry => {
      const duplicate = [...store.jobs, ...added].some(
        j => sameName(j.name, entry.name) && sameName(j.jobNumber, entry.jobNumber),
      );
      if (duplicate) {
        skipped += 1;
        return;
      }
      added.push({ id: makeId(), name: entry.name, jobNumber: entry.jobNumber, note: '' });
    });
  return { added, skipped };
}

export const withoutTag = (store: Store, id: string): Store => ({
  ...store,
  tags: store.tags.filter(t => t.id !== id),
  days: Object.fromEntries(
    Object.entries(store.days).map(([k, d]) => [
      k,
      {
        ...d,
        supervisorIds: d.supervisorIds.filter(s => s !== id),
        assignments: d.assignments.filter(a => a.tagId !== id && a.onTagId !== id),
      },
    ]),
  ),
});

export const withoutJob = (store: Store, id: string): Store => ({
  ...store,
  jobs: store.jobs.filter(j => j.id !== id),
  days: Object.fromEntries(
    Object.entries(store.days).map(([k, d]) => [
      k,
      {
        ...d,
        assignments: d.assignments.filter(a => a.jobId !== id),
        notes: Object.fromEntries(Object.entries(d.notes).filter(([key]) => !key.startsWith(`${id}|`))),
      },
    ]),
  ),
});

const storageKey = (tenantId: string) => `workforce-board-v3:${tenantId}`;

const load = (key: string): Store => {
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as Store) : initialStore;
};

export const historyOf = (store: Store): HistoryEntry[] =>
  Object.values(store.days)
    .filter(d => d.sent)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(d => ({ date: d.date, sent: d.sent! }));

export function useLocalStore(tenantId: string): StoreApi {
  const key = storageKey(tenantId);
  const [store, setStore] = useState<Store>(() => load(key));

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(store));
  }, [key, store]);

  const makeId = () => crypto.randomUUID();

  return {
    store,
    loading: false,
    history: historyOf(store),
    getDay: date => dayOf(store, date),
    dayLoaded: () => true,
    loadDay: () => {},
    loadHistory: () => {},
    assign: (date, tagId, categoryId, jobId) => setStore(prev => assignTo(prev, date, tagId, categoryId, jobId)),
    setSupervisor: (date, tagId) => setStore(prev => supervisorOn(prev, date, tagId)),
    crew: (date, tagId, assetId) => setStore(prev => crewTo(prev, date, tagId, assetId)),
    unassign: (date, tagId) => setStore(prev => unassignFrom(prev, date, tagId)),
    setNote: (date, jobId, categoryId, text) => setStore(prev => noteOn(prev, date, jobId, categoryId, text)),
    markSent: date =>
      setStore(prev =>
        sentOn(prev, date, { at: new Date().toISOString(), ...snapshotOf(dayOf(prev, date)) }),
      ),
    addTag: (name, type) => {
      const { added } = tagsAdded(store, [name], type, makeId);
      if (added.length === 0) return 'duplicate';
      setStore(prev => ({ ...prev, tags: [...prev.tags, ...added] }));
      return 'added';
    },
    addTags: (names, type) => {
      const { added, skipped } = tagsAdded(store, names, type, makeId);
      setStore(prev => ({ ...prev, tags: [...prev.tags, ...added] }));
      return { added: added.length, skipped };
    },
    removeTag: id => {
      const before = store;
      setStore(prev => withoutTag(prev, id));
      return () => setStore(before);
    },
    addJob: (name, jobNumber) => {
      const { added } = jobsAdded(store, [{ name: name.trim(), jobNumber: jobNumber.trim() }], makeId);
      if (added.length === 0) return 'duplicate';
      setStore(prev => ({ ...prev, jobs: [...prev.jobs, ...added] }));
      return 'added';
    },
    addJobs: lines => {
      const { added, skipped } = jobsAdded(store, lines.map(parseJobLine), makeId);
      setStore(prev => ({ ...prev, jobs: [...prev.jobs, ...added] }));
      return { added: added.length, skipped };
    },
    updateJob: (id, change) =>
      setStore(prev => ({ ...prev, jobs: prev.jobs.map(j => (j.id === id ? { ...j, ...change } : j)) })),
    removeJob: id => {
      const before = store;
      setStore(prev => withoutJob(prev, id));
      return () => setStore(before);
    },
    copyDay: async (from, to) => setStore(prev => copiedFrom(prev, from, to)),
    setOrgName: orgName => setStore(prev => ({ ...prev, orgName })),
    resetAll: () => setStore(initialStore),
  };
}
