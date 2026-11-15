import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import type { Assignment, RosterDay, RosterStatus, Tag, TagType } from '@workforce/shared';

export interface Store {
  orgName: string;
  tags: Tag[];
  locations: string[];
  days: Record<string, RosterDay>;
}

const storageKey = (tenantId: string) => `workforce-board-v2:${tenantId}`;

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
];

const demoLocations = ['North Depot', 'River Road', 'Park Street', 'Stockpile'];

export const initialStore: Store = {
  orgName: 'Your organisation',
  tags: demoTags,
  locations: demoLocations,
  days: {},
};

export const dayKey = (date: Date) => format(date, 'yyyy-MM-dd');

export const signature = (assignments: Assignment[]) =>
  JSON.stringify(
    [...assignments]
      .map(a => `${a.tagId}|${a.categoryId}|${a.location}`)
      .sort(),
  );

export const emptyDay = (date: string): RosterDay => ({ date, assignments: [] });

export const statusOf = (day: RosterDay): RosterStatus => {
  if (!day.sent) return 'draft';
  return signature(day.sent.assignments) === signature(day.assignments) ? 'sent' : 'changed';
};

const load = (key: string): Store => {
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as Store) : initialStore;
};

export function useStore(tenantId: string) {
  const key = storageKey(tenantId);
  const [store, setStore] = useState<Store>(() => load(key));

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(store));
  }, [key, store]);

  const getDay = useCallback(
    (date: string): RosterDay => store.days[date] ?? emptyDay(date),
    [store.days],
  );

  const updateDay = (date: string, change: (day: RosterDay) => RosterDay) =>
    setStore(prev => ({
      ...prev,
      days: { ...prev.days, [date]: change(prev.days[date] ?? emptyDay(date)) },
    }));

  const assign = (date: string, tagId: string, categoryId: string, location: string) =>
    updateDay(date, day => ({
      ...day,
      assignments: [
        ...day.assignments.filter(a => a.tagId !== tagId),
        { tagId, categoryId, location },
      ],
    }));

  const unassign = (date: string, tagId: string) =>
    updateDay(date, day => ({
      ...day,
      assignments: day.assignments.filter(a => a.tagId !== tagId),
    }));

  const markSent = (date: string) =>
    updateDay(date, day => ({
      ...day,
      sent: { at: new Date().toISOString(), assignments: day.assignments },
    }));

  const addTag = (name: string, type: TagType): 'added' | 'duplicate' => {
    const clean = name.trim();
    const exists = store.tags.some(t => t.type === type && t.name.toLowerCase() === clean.toLowerCase());
    if (exists) return 'duplicate';
    setStore(prev => ({
      ...prev,
      tags: [...prev.tags, { id: `${type[0]}-${Date.now()}`, name: clean, type }],
    }));
    return 'added';
  };

  const removeTag = (id: string) => {
    const before = store;
    setStore(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t.id !== id),
      days: Object.fromEntries(
        Object.entries(prev.days).map(([k, d]) => [
          k,
          { ...d, assignments: d.assignments.filter(a => a.tagId !== id) },
        ]),
      ),
    }));
    return () => setStore(before);
  };

  const addLocation = (name: string): 'added' | 'duplicate' => {
    const clean = name.trim();
    if (store.locations.some(l => l.toLowerCase() === clean.toLowerCase())) return 'duplicate';
    setStore(prev => ({ ...prev, locations: [...prev.locations, clean] }));
    return 'added';
  };

  const removeLocation = (name: string) => {
    const before = store;
    setStore(prev => ({
      ...prev,
      locations: prev.locations.filter(l => l !== name),
      days: Object.fromEntries(
        Object.entries(prev.days).map(([k, d]) => [
          k,
          { ...d, assignments: d.assignments.filter(a => a.location !== name) },
        ]),
      ),
    }));
    return () => setStore(before);
  };

  const setOrgName = (orgName: string) => setStore(prev => ({ ...prev, orgName }));

  const resetAll = () => setStore(initialStore);

  return {
    store,
    getDay,
    assign,
    unassign,
    markSent,
    addTag,
    removeTag,
    addLocation,
    removeLocation,
    setOrgName,
    resetAll,
  };
}

export type StoreApi = ReturnType<typeof useStore>;
