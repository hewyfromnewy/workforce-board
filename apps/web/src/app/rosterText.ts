import { format } from 'date-fns';
import { DEFAULT_CATEGORIES, noteKey } from '@workforce/shared';
import type { Job, RosterDay, Tag } from '@workforce/shared';

export function rosterText(date: Date, day: RosterDay, tags: Tag[], jobs: Job[]) {
  const tagById = new Map(tags.map(t => [t.id, t]));
  const lines = [`DAILY ROSTER - ${format(date, 'EEE dd/MM/yy')}`];

  const supervisors = day.supervisorIds.map(id => tagById.get(id)!.name);
  if (supervisors.length > 0) lines.push(`Supervisors: ${supervisors.join(', ')}`);
  lines.push('');

  jobs.forEach(job => {
    const rows = DEFAULT_CATEGORIES.map(cat => {
      const names = day.assignments
        .filter(a => a.jobId === job.id && a.categoryId === cat.id)
        .map(a => tagById.get(a.tagId)!.name);
      const note = day.notes[noteKey(job.id, cat.id)];
      if (names.length === 0 && !note) return null;
      return `  ${cat.name}: ${[names.join(', '), note].filter(Boolean).join(' - ')}`;
    }).filter(Boolean);
    if (rows.length === 0) return;
    lines.push(`${job.name.toUpperCase()}${job.jobNumber ? ` (${job.jobNumber})` : ''}`);
    if (job.note) lines.push(`  ${job.note}`);
    lines.push(...(rows as string[]), '');
  });

  const placed = [...day.assignments.map(a => a.tagId), ...day.supervisorIds];
  const people = placed.filter(id => tagById.get(id)!.type === 'member').length;
  lines.push(`Total: ${people} people | ${placed.length - people} assets`);
  return lines.join('\n');
}
