import { describe, expect, it } from 'vitest';
import type { Category, Tag } from '@workforce/shared';
import { addTag, buildRosterText, deleteTag, locateTag, moveTag, type BoardState } from './roster';

const alex: Tag = { id: 'm1', name: 'Alex Morgan', type: 'member' };
const truck: Tag = { id: 'a1', name: 'Truck #23', type: 'asset' };

const emptyCategories = (): Category[] => [
  { id: 'personnel', name: 'PERSONNEL', tags: [] },
  { id: 'plant', name: 'PLANT', tags: [] },
];

const makeState = (overrides: Partial<BoardState> = {}): BoardState => ({
  categories: emptyCategories(),
  holdingTags: [alex, truck],
  ...overrides,
});

describe('moveTag', () => {
  it('moves a tag from the holding area into a category cell', () => {
    const next = moveTag(makeState(), 'm1', null, 'personnel', 2);

    expect(next.holdingTags.map((t) => t.id)).toEqual(['a1']);
    expect(next.categories[0].tags).toEqual([{ ...alex, locationIndex: 2 }]);
  });

  it('moves a tag between categories and updates its location', () => {
    const placed = moveTag(makeState(), 'a1', null, 'plant', 0);
    const moved = moveTag(placed, 'a1', 'plant', 'personnel', 3);

    expect(moved.categories[1].tags).toEqual([]);
    expect(moved.categories[0].tags).toEqual([{ ...truck, locationIndex: 3 }]);
  });

  it('returns a tag to the holding area and clears its location', () => {
    const placed = moveTag(makeState(), 'm1', null, 'personnel', 1);
    const back = moveTag(placed, 'm1', 'personnel', null);

    expect(back.categories[0].tags).toEqual([]);
    const returned = back.holdingTags.find((t) => t.id === 'm1');
    expect(returned).toEqual(alex);
    expect(returned).not.toHaveProperty('locationIndex');
  });

  it('never duplicates a tag', () => {
    let state = makeState();
    state = moveTag(state, 'm1', null, 'personnel', 0);
    state = moveTag(state, 'm1', 'personnel', 'plant', 1);
    state = moveTag(state, 'm1', 'plant', null);

    const all = [...state.holdingTags, ...state.categories.flatMap((c) => c.tags)];
    expect(all.filter((t) => t.id === 'm1')).toHaveLength(1);
  });

  it('finds the tag even when the source hint is wrong', () => {
    const placed = moveTag(makeState(), 'm1', null, 'personnel', 0);
    // Caller claims it is still in the holding area
    const next = moveTag(placed, 'm1', null, 'plant', 4);

    expect(next.categories[0].tags).toEqual([]);
    expect(next.categories[1].tags).toEqual([{ ...alex, locationIndex: 4 }]);
  });

  it('returns the same state object when the tag does not exist', () => {
    const state = makeState();
    expect(moveTag(state, 'missing', null, 'personnel', 0)).toBe(state);
  });

  it('does not mutate the input state', () => {
    const state = makeState();
    const snapshot = JSON.stringify(state);
    moveTag(state, 'm1', null, 'personnel', 0);
    expect(JSON.stringify(state)).toBe(snapshot);
  });
});

describe('locateTag', () => {
  it('reports where a tag lives', () => {
    const placed = moveTag(makeState(), 'm1', null, 'personnel', 0);
    expect(locateTag(placed, 'm1', null)?.categoryId).toBe('personnel');
    expect(locateTag(placed, 'a1', null)?.categoryId).toBeNull();
    expect(locateTag(placed, 'nope', null)).toBeUndefined();
  });
});

describe('addTag / deleteTag', () => {
  it('adds new tags to the holding area', () => {
    const next = addTag(makeState(), { id: 'm9', name: 'New Person', type: 'member' });
    expect(next.holdingTags.map((t) => t.id)).toEqual(['m1', 'a1', 'm9']);
  });

  it('deletes a tag from the holding area', () => {
    const next = deleteTag(makeState(), 'm1');
    expect(next.holdingTags.map((t) => t.id)).toEqual(['a1']);
  });

  it('deletes a tag that has been placed on the board', () => {
    const placed = moveTag(makeState(), 'm1', null, 'personnel', 0);
    const next = deleteTag(placed, 'm1');
    expect(next.categories[0].tags).toEqual([]);
    expect(next.holdingTags.map((t) => t.id)).toEqual(['a1']);
  });
});

describe('buildRosterText', () => {
  it('lists locations, populated categories and totals', () => {
    let state = makeState();
    state = moveTag(state, 'm1', null, 'personnel', 0);
    state = moveTag(state, 'a1', null, 'plant', 1);

    const text = buildRosterText('Mon 01/01/24', state.categories, ['North Depot', 'Quarry Road']);

    expect(text).toContain('DAILY ROSTER - Mon 01/01/24');
    expect(text).toContain('• North Depot');
    expect(text).toContain('• Quarry Road');
    expect(text).toContain('PERSONNEL:\n   👤 Alex Morgan');
    expect(text).toContain('PLANT:\n   📦 Truck #23');
    expect(text).toContain('Total: 1 Personnel | 1 Assets');
  });

  it('omits empty categories and the locations section when there are none', () => {
    const text = buildRosterText('Mon 01/01/24', emptyCategories(), []);

    expect(text).not.toContain('LOCATIONS');
    expect(text).not.toContain('PERSONNEL:');
    expect(text).toContain('Total: 0 Personnel | 0 Assets');
  });
});
