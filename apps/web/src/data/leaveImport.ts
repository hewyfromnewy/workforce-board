/**
 * Leave bulk/CSV import (§4.8). Parse pasted spreadsheet rows into full-day
 * leave records, matching names to resources and expanding date ranges. Pure;
 * committing just adds LeaveRecords (source = 'import').
 *
 * Accepted row shapes (comma- or tab-separated), one per line:
 *   Name, 2026-08-10, 2026-08-14   (range)
 *   Name, 10/08/2026               (single day, DD/MM/YYYY)
 *   Name  2026-08-10  2026-08-10   (tab-separated from Excel)
 */
import { addDays, format } from 'date-fns';
import type { IsoDate, Resource } from '@workforce/shared';

export interface ParsedLeaveRow {
  name: string;
  start: IsoDate | null;
  end: IsoDate | null;
  raw: string;
}

export interface LeaveImportDay {
  resourceId: string;
  resourceName: string;
  date: IsoDate;
}

export interface LeaveImportPlan {
  rowsParsed: number;
  days: LeaveImportDay[];
  unmatched: { raw: string; reason: string }[];
}

const MAX_RANGE_DAYS = 366;

/** Normalise a date cell to ISO (YYYY-MM-DD). Accepts ISO and DD/MM/YYYY(-ish). */
export function normalizeDate(s: string): IsoDate | null {
  const t = s.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const m = t.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (m) {
    const d = m[1].padStart(2, '0');
    const mo = m[2].padStart(2, '0');
    const y = m[3].length === 2 ? `20${m[3]}` : m[3];
    const iso = `${y}-${mo}-${d}`;
    return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : null;
  }
  return null;
}

export function parseLeaveText(text: string): ParsedLeaveRow[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((raw) => {
      const fields = raw.split(/\t|,/).map((f) => f.trim()).filter(Boolean);
      const name = fields[0] ?? '';
      const start = fields[1] ? normalizeDate(fields[1]) : null;
      const end = fields[2] ? normalizeDate(fields[2]) : start;
      return { name, start, end, raw };
    });
}

function expandDays(start: IsoDate, end: IsoDate): IsoDate[] {
  const out: IsoDate[] = [];
  let cur = new Date(`${start}T00:00:00`);
  const last = new Date(`${end}T00:00:00`);
  for (let i = 0; i <= MAX_RANGE_DAYS && cur <= last; i++) {
    out.push(format(cur, 'yyyy-MM-dd'));
    cur = addDays(cur, 1);
  }
  return out;
}

export function buildLeaveImportPlan(resources: Resource[], text: string): LeaveImportPlan {
  const byName = new Map(resources.filter((r) => r.active).map((r) => [r.name.toLowerCase(), r] as const));
  const rows = parseLeaveText(text);
  const days: LeaveImportDay[] = [];
  const seen = new Set<string>();
  const unmatched: { raw: string; reason: string }[] = [];

  for (const row of rows) {
    if (!row.name) continue;
    const r = byName.get(row.name.toLowerCase());
    if (!r) {
      unmatched.push({ raw: row.raw, reason: 'name not found' });
      continue;
    }
    if (!row.start || !row.end) {
      unmatched.push({ raw: row.raw, reason: 'unreadable date' });
      continue;
    }
    if (row.end < row.start) {
      unmatched.push({ raw: row.raw, reason: 'end before start' });
      continue;
    }
    for (const date of expandDays(row.start, row.end)) {
      const key = `${r.id}|${date}`;
      if (seen.has(key)) continue;
      seen.add(key);
      days.push({ resourceId: r.id, resourceName: r.name, date });
    }
  }
  return { rowsParsed: rows.length, days, unmatched };
}
