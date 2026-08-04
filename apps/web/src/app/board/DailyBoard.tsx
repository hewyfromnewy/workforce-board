import { RESOURCE_TYPE_COLUMNS, type ResourceType } from '@workforce/shared';
import { useBoard } from '@/data/RepoContext';
import type { Placement, SiteRow } from '@/data/types';
import { ResourceTag } from './ResourceTag';
import { Drop } from './DropZone';
import { ResourcePool } from './ResourcePool';

const GRID = 'minmax(160px, 1.2fr) 1.4fr 1.4fr 0.9fr 1fr 1.2fr';

function TypeCell({ placements }: { placements: Placement[] }) {
  return (
    <div className="flex flex-wrap gap-1 border-l border-slate-200 p-1.5">
      {placements.map((p) => (
        <ResourceTag key={p.resource.id + p.slot} resource={p.resource} slot={p.slot} />
      ))}
    </div>
  );
}

export function DailyBoard({ date }: { date: string }) {
  const { board, loading, placeAtSite, sendTo, setLeave } = useBoard(date);

  if (loading || !board) return <div className="p-6 text-slate-500">Loading board…</div>;

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="min-w-0 flex-1 space-y-4">
      <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white shadow-sm">
        <div className="min-w-[900px]">
          {/* Header */}
          <div className="grid bg-slate-800 text-xs font-bold uppercase tracking-wide text-white" style={{ gridTemplateColumns: GRID }}>
            <div className="px-3 py-2">Job Site</div>
            {RESOURCE_TYPE_COLUMNS.map((c) => (
              <div key={c.type} className="px-3 py-2">{c.label}</div>
            ))}
            <div className="px-3 py-2">Traffic / Notes</div>
          </div>

          {/* Job-site rows — each row is a drop target that places at that site */}
          {board.sites.map((row: SiteRow) => (
            <Drop
              key={row.site.id}
              onDrop={(rid) => placeAtSite(rid, row.site.id)}
              className="grid border-t border-slate-300"
              style={{ gridTemplateColumns: GRID }}
            >
              <div className="bg-slate-50 p-2">
                <div className="text-sm font-bold leading-tight">{row.site.name}</div>
                <div className="text-xs font-semibold text-slate-500">#{row.site.jobNumber}</div>
              </div>
              {RESOURCE_TYPE_COLUMNS.map((c) => (
                <TypeCell key={c.type} placements={row.byType[c.type as ResourceType]} />
              ))}
              <div className="border-l border-slate-200 p-2 text-sm">
                {row.traffic && (
                  <div className="font-bold">
                    ×{row.traffic.count} <span className="font-medium">{row.traffic.provider}</span>
                  </div>
                )}
                {row.note && <div className="italic text-slate-600">{row.note}</div>}
              </div>
            </Drop>
          ))}
        </div>
      </div>

      {/* Leave / Training areas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Drop onDrop={(rid) => setLeave(rid, true)} className="rounded-lg border border-slate-300 bg-white p-3">
          <div className="mb-2 text-xs font-bold uppercase text-slate-500">On leave</div>
          <div className="flex flex-wrap gap-1.5">
            {board.leave.length === 0 && <span className="text-sm text-slate-400">— drop here to mark on leave —</span>}
            {board.leave.map((r) => (
              <ResourceTag key={r.id} resource={r} />
            ))}
          </div>
        </Drop>
        <Drop onDrop={(rid) => sendTo(rid, 'training')} className="rounded-lg border border-slate-300 bg-white p-3">
          <div className="mb-2 text-xs font-bold uppercase text-slate-500">Training</div>
          <div className="flex flex-wrap gap-1.5">
            {board.training.length === 0 && <span className="text-sm text-slate-400">— drop here for training —</span>}
            {board.training.map((p) => (
              <ResourceTag key={p.resource.id} resource={p.resource} slot={p.slot} />
            ))}
          </div>
        </Drop>
      </div>
      </div>
      <ResourcePool resources={board.unassigned} onDropResource={(rid) => sendTo(rid, 'unassigned')} />
    </div>
  );
}
