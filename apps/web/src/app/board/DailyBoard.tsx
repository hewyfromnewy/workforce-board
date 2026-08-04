import { useRef, useState } from 'react';
import { RESOURCE_TYPE_COLUMNS, type AssignmentSlot, type ResourceType } from '@workforce/shared';
import { useBoard } from '@/data/RepoContext';
import { resolveSiteDrop } from '@/data/dropResolver';
import type { Destination, Placement, SiteRow } from '@/data/types';
import { renderElementToPng, downloadBlob, copyBlobToClipboard } from '@/spike/exportPng';
import { ResourceTag } from './ResourceTag';
import { Drop } from './DropZone';
import { ResourcePool } from './ResourcePool';
import { ExportableBoard } from './ExportableBoard';

const GRID = 'minmax(160px, 1.2fr) 1.4fr 1.4fr 0.9fr 1fr 1.2fr';

type Pending =
  | { kind: 'override'; resourceId: string; target: Destination; reason: 'leave' | 'training' }
  | { kind: 'movesplit'; resourceId: string; sourceSiteId: string; targetSiteId: string };

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
  const { board, loading, place, setLeave } = useBoard(date);
  const exportRef = useRef<HTMLDivElement>(null);
  const [shareStatus, setShareStatus] = useState('');
  const [pending, setPending] = useState<Pending | null>(null);

  async function handleShare() {
    if (!exportRef.current) return;
    setShareStatus('rendering…');
    try {
      const blob = await renderElementToPng(exportRef.current, 2);
      downloadBlob(blob, `board-${date}.png`);
      const copied = await copyBlobToClipboard(blob);
      setShareStatus(`${Math.round(blob.size / 1024)} KB · ${copied ? 'copied + downloaded' : 'downloaded'}`);
    } catch (e) {
      setShareStatus(`failed: ${(e as Error).message}`);
    }
  }

  if (loading || !board) return <div className="p-6 text-slate-500">Loading board…</div>;

  // --- lookups over the current board ---
  const siteName = new Map(board.sites.map((r) => [r.site.id, r.site.name]));
  const nameById = new Map<string, string>();
  for (const row of board.sites)
    for (const col of Object.values(row.byType)) for (const p of col) nameById.set(p.resource.id, p.resource.name);
  for (const p of board.training) nameById.set(p.resource.id, p.resource.name);
  for (const r of board.leave) nameById.set(r.id, r.name);
  for (const r of board.unassigned) nameById.set(r.id, r.name);

  function infoOf(resourceId: string) {
    const sitePlacements: { siteId: string; slot: AssignmentSlot }[] = [];
    for (const row of board!.sites)
      for (const col of Object.values(row.byType))
        for (const p of col) if (p.resource.id === resourceId) sitePlacements.push({ siteId: row.site.id, slot: p.slot });
    return {
      sitePlacements,
      inTraining: board!.training.some((p) => p.resource.id === resourceId),
      onLeave: board!.leave.some((r) => r.id === resourceId),
    };
  }

  const put = (resourceId: string, slot: AssignmentSlot, destination: Destination) =>
    void place({ resourceId, date, slot, destination });

  // Dropping a resource onto a job site.
  function assignToSite(resourceId: string, draggedSlot: AssignmentSlot, targetSiteId: string) {
    const action = resolveSiteDrop(infoOf(resourceId), targetSiteId, draggedSlot);
    switch (action.kind) {
      case 'noop':
        return;
      case 'place':
        return put(resourceId, action.slot, { type: 'job_site', jobSiteId: targetSiteId });
      case 'override':
        return setPending({ kind: 'override', resourceId, target: { type: 'job_site', jobSiteId: targetSiteId }, reason: action.reason });
      case 'movesplit':
        return setPending({ kind: 'movesplit', resourceId, sourceSiteId: action.sourceSiteId, targetSiteId });
    }
  }

  function assignToTraining(resourceId: string) {
    const info = infoOf(resourceId);
    if (info.onLeave) {
      setPending({ kind: 'override', resourceId, target: { type: 'training' }, reason: 'leave' });
      return;
    }
    put(resourceId, 'full', { type: 'training' });
  }

  async function confirmOverride(p: Extract<Pending, { kind: 'override' }>) {
    if (p.reason === 'leave') await setLeave(p.resourceId, false);
    await place({ resourceId: p.resourceId, date, slot: 'full', destination: p.target });
    setPending(null);
  }
  async function confirmMove(p: Extract<Pending, { kind: 'movesplit' }>) {
    await place({ resourceId: p.resourceId, date, slot: 'full', destination: { type: 'job_site', jobSiteId: p.targetSiteId } });
    setPending(null);
  }
  async function confirmSplit(p: Extract<Pending, { kind: 'movesplit' }>) {
    await place({ resourceId: p.resourceId, date, slot: 'am', destination: { type: 'job_site', jobSiteId: p.sourceSiteId } });
    await place({ resourceId: p.resourceId, date, slot: 'pm', destination: { type: 'job_site', jobSiteId: p.targetSiteId } });
    setPending(null);
  }

  return (
    <div className="relative flex flex-col gap-4 lg:flex-row">
      <div className="min-w-0 flex-1 space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={handleShare} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Share as image
          </button>
          <span className="text-sm text-slate-500">{shareStatus}</span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white shadow-sm">
          <div className="min-w-[900px]">
            <div className="grid bg-slate-800 text-xs font-bold uppercase tracking-wide text-white" style={{ gridTemplateColumns: GRID }}>
              <div className="px-3 py-2">Job Site</div>
              {RESOURCE_TYPE_COLUMNS.map((c) => (
                <div key={c.type} className="px-3 py-2">{c.label}</div>
              ))}
              <div className="px-3 py-2">Traffic / Notes</div>
            </div>

            {board.sites.map((row: SiteRow) => (
              <Drop
                key={row.site.id}
                onDrop={(rid, slot) => assignToSite(rid, slot, row.site.id)}
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
          <Drop onDrop={(rid) => assignToTraining(rid)} className="rounded-lg border border-slate-300 bg-white p-3">
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

      <ResourcePool resources={board.unassigned} onDropResource={(rid, slot) => put(rid, slot, { type: 'unassigned' })} />

      {/* Off-screen, fixed-width render target for the shareable PNG. */}
      <div aria-hidden className="pointer-events-none absolute -left-[10000px] top-0">
        <div ref={exportRef}>
          <ExportableBoard board={board} />
        </div>
      </div>

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            {pending.kind === 'override' ? (
              <>
                <h3 className="text-base font-bold text-slate-900">Override {pending.reason}?</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {nameById.get(pending.resourceId) ?? 'This resource'} is on {pending.reason} today. Assign anyway?
                </p>
                <div className="mt-4 flex justify-end gap-2">
                  <button onClick={() => setPending(null)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100">Cancel</button>
                  <button onClick={() => confirmOverride(pending)} className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700">Assign anyway</button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold text-slate-900">
                  {nameById.get(pending.resourceId) ?? 'Resource'} is already at {siteName.get(pending.sourceSiteId)}
                </h3>
                <p className="mt-1 text-sm text-slate-600">Move to {siteName.get(pending.targetSiteId)}, or split the day?</p>
                <div className="mt-4 flex flex-col gap-2">
                  <button onClick={() => confirmMove(pending)} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                    Move to {siteName.get(pending.targetSiteId)}
                  </button>
                  <button onClick={() => confirmSplit(pending)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100">
                    Split — AM at {siteName.get(pending.sourceSiteId)}, PM at {siteName.get(pending.targetSiteId)}
                  </button>
                  <button onClick={() => setPending(null)} className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100">Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
