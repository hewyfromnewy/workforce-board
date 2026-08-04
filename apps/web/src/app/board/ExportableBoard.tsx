/**
 * The image render target (#8). A static, fixed-width, whiteboard-shaped board
 * built from live BoardData — this is what gets rendered to PNG and sent to the
 * crew. Kept separate from the interactive DailyBoard so the image is clean and
 * consistent regardless of screen. Layout/legibility validated in the #4 spike
 * (ADR 0002).
 */
import { format } from 'date-fns';
import { RESOURCE_TYPE_COLUMNS, type AssignmentSlot, type Resource, type ResourceType } from '@workforce/shared';
import type { BoardData, Placement } from '@/data/types';

/** Fixed export width in CSS px (×2 scale → 2160px PNG). Phone-friendly. */
export const EXPORT_WIDTH = 1080;

const TAG: Record<ResourceType, string> = {
  person: 'bg-amber-100 border-amber-400 text-amber-950',
  plant: 'bg-emerald-100 border-emerald-500 text-emerald-950',
  hire: 'bg-sky-100 border-sky-400 text-sky-950',
  contractor: 'bg-violet-100 border-violet-400 text-violet-950',
};

function Pill({ resource, slot }: { resource: Resource; slot?: AssignmentSlot }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[15px] font-medium ${TAG[resource.type]}`}>
      {resource.name}
      {slot && slot !== 'full' && (
        <span className="rounded bg-slate-800 px-1 text-[11px] font-bold uppercase text-white">{slot}</span>
      )}
    </span>
  );
}

const HEAD = 'border border-slate-600 bg-slate-800 px-2 py-1.5 text-left text-[14px] font-bold uppercase tracking-wide text-white';

function Area({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded border border-slate-300 p-2">
      <div className="mb-1 text-[13px] font-bold uppercase text-slate-500">{title}</div>
      <div className="flex flex-wrap gap-1.5 text-[15px]">{children}</div>
    </div>
  );
}

export function ExportableBoard({ board }: { board: BoardData }) {
  const dateLabel = format(new Date(`${board.date}T00:00:00`), 'EEE dd/MM/yy');

  return (
    <div style={{ width: EXPORT_WIDTH }} className="bg-white p-4 font-sans text-slate-900">
      <div className="mb-3 flex items-baseline justify-between border-b-2 border-slate-800 pb-2">
        <h1 className="text-2xl font-black tracking-tight">DAILY BOARD — Road Construction</h1>
        <span className="text-lg font-bold">{dateLabel}</span>
      </div>

      <table className="w-full table-fixed border-collapse">
        <colgroup>
          <col style={{ width: '18%' }} />
          <col style={{ width: '19%' }} />
          <col style={{ width: '19%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '14%' }} />
          <col style={{ width: '18%' }} />
        </colgroup>
        <thead>
          <tr>
            <th className={HEAD}>Job Site</th>
            {RESOURCE_TYPE_COLUMNS.map((c) => (
              <th key={c.type} className={HEAD}>{c.label}</th>
            ))}
            <th className={HEAD}>Traffic / Notes</th>
          </tr>
        </thead>
        <tbody>
          {board.sites.map((row) => (
            <tr key={row.site.id}>
              <td className="border border-slate-300 bg-slate-100 p-1.5 align-top">
                <div className="text-[16px] font-bold leading-tight">{row.site.name}</div>
                <div className="text-[13px] font-semibold text-slate-500">#{row.site.jobNumber}</div>
              </td>
              {RESOURCE_TYPE_COLUMNS.map((c) => (
                <td key={c.type} className="border border-slate-300 p-1.5 align-top">
                  <div className="flex flex-wrap gap-1">
                    {row.byType[c.type as ResourceType].map((p: Placement) => (
                      <Pill key={p.resource.id + p.slot} resource={p.resource} slot={p.slot} />
                    ))}
                  </div>
                </td>
              ))}
              <td className="border border-slate-300 p-1.5 align-top text-[14px]">
                {row.traffic && (
                  <div className="font-bold">
                    ×{row.traffic.count} <span className="font-medium">{row.traffic.provider}</span>
                  </div>
                )}
                {row.note && <div className="italic text-slate-600">{row.note}</div>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Area title="On leave">
          {board.leave.map((r) => <Pill key={r.id} resource={r} />)}
        </Area>
        <Area title="Training">
          {board.training.map((p) => <Pill key={p.resource.id} resource={p.resource} slot={p.slot} />)}
        </Area>
        <Area title="Unassigned">
          {board.unassigned.map((r) => <Pill key={r.id} resource={r} />)}
        </Area>
      </div>
    </div>
  );
}
