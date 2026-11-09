import type { Category, Tag } from '@workforce/shared';

export const STORAGE_KEY = 'workforce-roster-data';

export interface PersistedState {
  categories?: Category[];
  locations?: string[];
  holdingTags?: Tag[];
  /** ISO date string */
  date?: string;
}

/** Minimal subset of the Storage interface, so tests can inject a fake. */
export type KeyValueStore = Pick<Storage, 'getItem' | 'setItem'>;

/**
 * Load persisted state. Returns `null` if nothing is stored, and `null`
 * (rather than throwing) if the stored value is corrupt.
 */
export function loadState(store: KeyValueStore): PersistedState | null {
  const raw = store.getItem(STORAGE_KEY);
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as PersistedState;
    return null;
  } catch {
    return null;
  }
}

export function saveState(store: KeyValueStore, state: PersistedState): void {
  store.setItem(STORAGE_KEY, JSON.stringify(state));
}
