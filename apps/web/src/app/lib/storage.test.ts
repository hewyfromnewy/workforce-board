import { describe, expect, it } from 'vitest';
import { loadState, saveState, STORAGE_KEY, type KeyValueStore } from './storage';

function fakeStore(initial: Record<string, string> = {}): KeyValueStore & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

describe('storage', () => {
  it('returns null when nothing has been saved', () => {
    expect(loadState(fakeStore())).toBeNull();
  });

  it('round-trips saved state', () => {
    const store = fakeStore();
    const state = {
      categories: [{ id: 'personnel', name: 'PERSONNEL', tags: [] }],
      locations: ['North Depot'],
      holdingTags: [{ id: 'm1', name: 'Alex Morgan', type: 'member' as const }],
      date: '2024-01-01T00:00:00.000Z',
    };
    saveState(store, state);
    expect(loadState(store)).toEqual(state);
  });

  it('writes under the expected key', () => {
    const store = fakeStore();
    saveState(store, { locations: [] });
    expect(Object.keys(store.data)).toEqual([STORAGE_KEY]);
  });

  it('returns null instead of throwing on corrupt data', () => {
    expect(loadState(fakeStore({ [STORAGE_KEY]: '{not json' }))).toBeNull();
  });

  it('returns null for non-object JSON', () => {
    expect(loadState(fakeStore({ [STORAGE_KEY]: '42' }))).toBeNull();
    expect(loadState(fakeStore({ [STORAGE_KEY]: 'null' }))).toBeNull();
  });
});
