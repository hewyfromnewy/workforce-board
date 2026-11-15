import { format } from 'date-fns';
import { DEFAULT_CATEGORIES } from '@workforce/shared';
import type { RosterDay, Tag } from '@workforce/shared';

export function rosterText(date: Date, day: RosterDay, tags: Tag[], locations: string[]) {
  const tagById = new Map(tags.map(t => [t.id, t]));
  const lines = [`DAILY ROSTER - ${format(date, 'EEE dd/MM/yy')}`, ''];

  locations.forEach(location => {
    const here = day.assignments.filter(a => a.location === location);
    if (here.length === 0) return;
    lines.push(location.toUpperCase());
    DEFAULT_CATEGORIES.forEach(cat => {
      const names = here
        .filter(a => a.categoryId === cat.id)
        .map(a => tagById.get(a.tagId)?.name)
        .filter(Boolean);
      if (names.length > 0) lines.push(`  ${cat.name}: ${names.join(', ')}`);
    });
    lines.push('');
  });

  const people = day.assignments.filter(a => tagById.get(a.tagId)?.type === 'member').length;
  const assets = day.assignments.length - people;
  lines.push(`Total: ${people} people | ${assets} assets`);
  return lines.join('\n');
}
