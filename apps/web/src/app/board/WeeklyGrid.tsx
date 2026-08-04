import { useState } from 'react';
import { addDays, format } from 'date-fns';
import type { ResourceType } from '@workforce/shared';
import { useWeek, useRepo } from '@/data/RepoContext';
import type { CopyPlan } from '@/data/copyForward';
import type { WeekCell, WeekPlacement } from '@/data/types';
import { CopyPreviewModal } from './CopyPreviewModal';

const TYPE_DOT: Record<ResourceType, string> = {
  person: 'bg-amber-400',
  plant: 'bg-emerald-500',
  hire: 'bg-sky-400',
  contractor: 'bg-violet-400',
};

function fmt(date: string, f: string) {
  return format(new Date(`${date}T00:00:00`), f);
}

function Chip({ p }: { p: WeekPlacement }) {
  const style =
    p.kind === 'leave'
      ? 'bg-slate-200 text-slate-700 border-slate-300'
      : p.kind === 'training'
        ? 'bg-violet-50 text-violet-900 border-violet-300'
        : 'bg-emerald-50 text-emerald-900 border-emerald-300';
  return (
    <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs font-medium ${style}`}>
      {p.slot !== 'full' && (
        <span className="rounded bg-slate-800 px-1 text-[9px] font-bold uppercase text-white">{p.slot}</span>
      )}
      {p.label}
    </span>
  );
}

function CellView({ cell, today }: { cell: WeekCell; today: string }) {
  const isToday = cell.date === today;
  return (
    <td className={`border border-slate-200 p-1 align-top ${isToday ? 'bg-blue-50/40' : ''}`}>
      {cell.placements.length === 0 ? (
        <span className="text-slate-300">·</span>
      ) : (
        <div className="flex flex-col gap-1">
          {cell.placements.map((p) => (
            <Chip key={p.slot + p.label} p={p} />
          ))}
        </div>
      )}
    </td>
  );
}

export function WeeklyGrid({ startDate }: { startDate: string }) {
  const { week, loading, refresh } = useWeek(startDate);
  const repo = useRepo();
  const today = format(new Date(), 'yyyy-MM-dd');
  const [copyPlan, setCopyPlan] = useState<CopyPlan | null>(null);

  async function previewCopyNextWeek() {
    const next = format(addDays(new Date(`${startDate}T00:00:00`), 7), 'yyyy-MM-dd');
    setCopyPlan(await repo.planCopyWeek(startDate, next));
  }
  async function commitCopy() {
    if (copyPlan) await repo.commitCopy(copyPlan);
    setCopyPlan(null);
    await refresh();
  }

  if (loading || !week) return <div className="p-6 text-slate-500">Loading week…</div>;

  return (
    <div className="space-y-3">
      <div>
        <button onClick={previewCopyNextWeek} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
          Copy this week → next week
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 min-w-[180px] border border-slate-600 bg-slate-800 px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-white">
              Resource
            </th>
            {week.days.map((d) => (
              <th
                key={d}
                className={`min-w-[120px] border border-slate-600 bg-slate-800 px-2 py-1.5 text-center text-white ${d === today ? 'bg-blue-700' : ''}`}
              >
                <div className="text-xs font-bold uppercase">{fmt(d, 'EEE')}</div>
                <div className="text-[11px] font-medium text-slate-300">{fmt(d, 'dd/MM')}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {week.rows.map((row) => (
            <tr key={row.resource.id}>
              <td className="sticky left-0 z-10 border border-slate-200 bg-white px-3 py-1.5">
                <span className="flex items-center gap-2">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${TYPE_DOT[row.resource.type]}`} />
                  <span className="font-medium text-slate-800">{row.resource.name}</span>
                </span>
              </td>
              {row.cells.map((cell) => (
                <CellView key={cell.date} cell={cell} today={today} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {copyPlan && <CopyPreviewModal plan={copyPlan} onCancel={() => setCopyPlan(null)} onConfirm={commitCopy} />}
    </div>
  );
}
