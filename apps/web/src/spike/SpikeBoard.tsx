/**
 * Image-export spike (#4) — a representative whiteboard-shaped daily board with
 * realistic-ish sample data, rendered at a FIXED width so the PNG is consistent
 * regardless of screen. This is a throwaway spike to de-risk render-to-PNG
 * before real screens are built (spec build order #2); the data here is
 * illustrative, not the board-photo transcription (that's #3).
 */
import { useRef, useState } from 'react';
import {
  renderElementToPng,
  downloadBlob,
  copyBlobToClipboard,
} from './exportPng';

// Fixed export width in CSS px (×2 scale → 2160px PNG). Phone-friendly.
const BOARD_WIDTH = 1080;

type Person = { name: string; half?: 'AM' | 'PM' };
type Plant = { name: string; half?: 'AM' | 'PM' };

interface Site {
  name: string;
  job: string;
  personnel: Person[];
  plant: Plant[];
  hire: string[];
  contractors: string[];
  traffic?: { count: number; provider: string };
  notes?: string;
}

const SITES: Site[] = [
  {
    name: 'Clarence Town Rd Seg 170',
    job: '13590',
    personnel: [{ name: 'Chris Chamberlain' }, { name: 'Dave Reeves' }],
    plant: [{ name: 'Excavator 13T', half: 'AM' }, { name: 'Roller CB2.7' }],
    hire: [],
    contractors: [],
    traffic: { count: 3, provider: 'PTS Traffic' },
    notes: 'shovel, concrete rakes, broom',
  },
  {
    name: 'Medowie Rd Shoulder',
    job: '13612',
    personnel: [{ name: 'Sam Tan' }, { name: 'Luke Ford' }],
    plant: [{ name: 'Grader 12H' }, { name: 'Excavator 13T', half: 'PM' }],
    hire: ['Water Cart'],
    contractors: [],
    traffic: { count: 2, provider: 'PTS Traffic' },
  },
  {
    name: 'Nelson Bay Rd Patching',
    job: '13588',
    personnel: [{ name: 'Joel Ward' }],
    plant: [{ name: 'Paver' }, { name: 'Truck 188' }],
    hire: [],
    contractors: ['Boral (asphalt)'],
    traffic: { count: 4, provider: 'Roadwork TC' },
    notes: 'hotmix AM start',
  },
];

const ON_LEAVE = ['Rod Blake', 'Terry Hall'];
const TRAINING = ['Priya Nair — Traffic ticket'];
const UNASSIGNED = ['188 Ute', 'Bobcat S570', 'Nathan Cole'];

function Tag({ label, half, kind }: { label: string; half?: 'AM' | 'PM'; kind: 'person' | 'plant' }) {
  const base =
    kind === 'person'
      ? 'bg-amber-100 border-amber-400 text-amber-950'
      : 'bg-emerald-100 border-emerald-500 text-emerald-950';
  return (
    <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[15px] font-medium ${base}`}>
      {label}
      {half && (
        <span className="rounded bg-slate-800 px-1 text-[11px] font-bold text-white">{half}</span>
      )}
    </span>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <td className="border border-slate-300 align-top p-1.5">
      <div className="flex flex-wrap gap-1">{children}</div>
    </td>
  );
}

const HEAD = 'border border-slate-600 bg-slate-800 px-2 py-1.5 text-left text-[14px] font-bold uppercase tracking-wide text-white';

/** The exportable board. Fixed width; everything sized for legibility at BOARD_WIDTH. */
function Board() {
  return (
    <div style={{ width: BOARD_WIDTH }} className="bg-white p-4 font-sans text-slate-900">
      <div className="mb-3 flex items-baseline justify-between border-b-2 border-slate-800 pb-2">
        <h1 className="text-2xl font-black tracking-tight">DAILY BOARD — Road Construction</h1>
        <span className="text-lg font-bold">Tue 04/08/26</span>
      </div>
      <table className="w-full border-collapse table-fixed">
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
            <th className={HEAD}>Personnel</th>
            <th className={HEAD}>Plant</th>
            <th className={HEAD}>Hire</th>
            <th className={HEAD}>Contractors</th>
            <th className={HEAD}>Traffic / Notes</th>
          </tr>
        </thead>
        <tbody>
          {SITES.map((s) => (
            <tr key={s.job}>
              <td className="border border-slate-300 bg-slate-100 p-1.5 align-top">
                <div className="text-[16px] font-bold leading-tight">{s.name}</div>
                <div className="text-[13px] font-semibold text-slate-500">#{s.job}</div>
              </td>
              <Cell>
                {s.personnel.map((p) => (
                  <Tag key={p.name} label={p.name} half={p.half} kind="person" />
                ))}
              </Cell>
              <Cell>
                {s.plant.map((p) => (
                  <Tag key={p.name + (p.half ?? '')} label={p.name} half={p.half} kind="plant" />
                ))}
              </Cell>
              <Cell>
                {s.hire.map((h) => (
                  <Tag key={h} label={h} kind="plant" />
                ))}
              </Cell>
              <Cell>
                {s.contractors.map((c) => (
                  <Tag key={c} label={c} kind="plant" />
                ))}
              </Cell>
              <td className="border border-slate-300 p-1.5 align-top text-[14px]">
                {s.traffic && (
                  <div className="font-bold">
                    ×{s.traffic.count} <span className="font-medium">{s.traffic.provider}</span>
                  </div>
                )}
                {s.notes && <div className="italic text-slate-600">{s.notes}</div>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 grid grid-cols-3 gap-2 text-[14px]">
        <div className="rounded border border-slate-300 p-2">
          <div className="mb-1 font-bold uppercase text-slate-500">On leave</div>
          {ON_LEAVE.map((n) => (
            <div key={n}>{n}</div>
          ))}
        </div>
        <div className="rounded border border-slate-300 p-2">
          <div className="mb-1 font-bold uppercase text-slate-500">Training</div>
          {TRAINING.map((n) => (
            <div key={n}>{n}</div>
          ))}
        </div>
        <div className="rounded border border-slate-300 p-2">
          <div className="mb-1 font-bold uppercase text-slate-500">Unassigned</div>
          {UNASSIGNED.map((n) => (
            <div key={n}>{n}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SpikeBoard() {
  const boardRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  async function handleExport() {
    if (!boardRef.current) return;
    setStatus('rendering…');
    try {
      const blob = await renderElementToPng(boardRef.current, 2);
      const url = URL.createObjectURL(blob);
      setPreview(url);
      // Expose for automated validation.
      (window as unknown as { __spikePng?: string }).__spikePng = url;
      downloadBlob(blob, 'daily-board-spike.png');
      const copied = await copyBlobToClipboard(blob);
      setStatus(`done — ${Math.round(blob.size / 1024)} KB PNG, ${copied ? 'copied to clipboard + ' : ''}downloaded`);
    } catch (e) {
      setStatus(`FAILED: ${(e as Error).message}`);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-4 flex items-center gap-3">
        <button
          id="export-btn"
          onClick={handleExport}
          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Export PNG
        </button>
        <span id="export-status" className="text-sm text-slate-600">{status}</span>
      </div>

      {/* The exportable, fixed-width board (horizontally scrollable on small screens). */}
      <div className="overflow-x-auto rounded-lg border border-slate-300 shadow">
        <div ref={boardRef}>
          <Board />
        </div>
      </div>

      {preview && (
        <div className="mt-6">
          <div className="mb-2 text-sm font-semibold text-slate-500">Rendered PNG output:</div>
          <img id="export-preview" src={preview} alt="exported PNG" className="max-w-full rounded border border-slate-300" />
        </div>
      )}
    </div>
  );
}
