import type { Category, Tag } from '@workforce/shared';

/** The part of the board state that tag movements operate on. */
export interface BoardState {
  categories: Category[];
  holdingTags: Tag[];
}

/**
 * Locate a tag on the board. Returns the tag and the category it lives in
 * (`null` means the holding area), or `undefined` if it isn't on the board.
 * The hinted source is checked first, then everywhere else.
 */
export function locateTag(
  state: BoardState,
  tagId: string,
  hintCategoryId: string | null,
): { tag: Tag; categoryId: string | null } | undefined {
  if (hintCategoryId === null) {
    const tag = state.holdingTags.find((t) => t.id === tagId);
    if (tag) return { tag, categoryId: null };
  } else {
    const tag = state.categories
      .find((c) => c.id === hintCategoryId)
      ?.tags.find((t) => t.id === tagId);
    if (tag) return { tag, categoryId: hintCategoryId };
  }

  const held = state.holdingTags.find((t) => t.id === tagId);
  if (held) return { tag: held, categoryId: null };

  for (const category of state.categories) {
    const tag = category.tags.find((t) => t.id === tagId);
    if (tag) return { tag, categoryId: category.id };
  }
  return undefined;
}

/**
 * Move a tag to a category cell (with a location row) or back to the
 * holding area (`toCategoryId === null`). Pure: returns a new state, or the
 * same state object if the tag can't be found.
 */
export function moveTag(
  state: BoardState,
  tagId: string,
  fromCategoryId: string | null,
  toCategoryId: string | null,
  locationIndex?: number,
): BoardState {
  const found = locateTag(state, tagId, fromCategoryId);
  if (!found) return state;

  const { tag, categoryId: sourceId } = found;

  let holdingTags = state.holdingTags;
  if (sourceId === null) {
    holdingTags = holdingTags.filter((t) => t.id !== tagId);
  }
  if (toCategoryId === null) {
    const { locationIndex: _unused, ...withoutLocation } = tag;
    holdingTags = [...holdingTags, withoutLocation];
  }

  let categories = state.categories;
  if (sourceId !== null) {
    categories = categories.map((c) =>
      c.id === sourceId ? { ...c, tags: c.tags.filter((t) => t.id !== tagId) } : c,
    );
  }
  if (toCategoryId !== null) {
    const placed: Tag = { ...tag, locationIndex };
    categories = categories.map((c) =>
      c.id === toCategoryId ? { ...c, tags: [...c.tags, placed] } : c,
    );
  }

  return { categories, holdingTags };
}

/** Add a new tag to the holding area. */
export function addTag(state: BoardState, tag: Tag): BoardState {
  return { ...state, holdingTags: [...state.holdingTags, tag] };
}

/** Remove a tag from the holding area and every category. */
export function deleteTag(state: BoardState, tagId: string): BoardState {
  return {
    holdingTags: state.holdingTags.filter((t) => t.id !== tagId),
    categories: state.categories.map((c) => ({
      ...c,
      tags: c.tags.filter((t) => t.id !== tagId),
    })),
  };
}

/** Plain-text roster used for clipboard and WhatsApp sharing. */
export function buildRosterText(
  dateLabel: string,
  categories: Category[],
  locations: string[],
): string {
  let output = `📋 DAILY ROSTER - ${dateLabel}\n\n`;

  if (locations.length > 0) {
    output += `📍 LOCATIONS:\n`;
    for (const location of locations) output += `   • ${location}\n`;
    output += '\n';
  }

  for (const cat of categories) {
    if (cat.tags.length === 0) continue;
    output += `${cat.name}:\n`;
    for (const tag of cat.tags.filter((t) => t.type === 'member')) {
      output += `   👤 ${tag.name}\n`;
    }
    for (const tag of cat.tags.filter((t) => t.type === 'asset')) {
      output += `   📦 ${tag.name}\n`;
    }
    output += '\n';
  }

  const count = (type: Tag['type']) =>
    categories.reduce((sum, c) => sum + c.tags.filter((t) => t.type === type).length, 0);

  output += `───────────────────\n`;
  output += `Total: ${count('member')} Personnel | ${count('asset')} Assets\n`;
  return output;
}
