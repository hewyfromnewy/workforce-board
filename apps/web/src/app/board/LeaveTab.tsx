import { useState } from 'react';
import type { Resource } from '@workforce/shared';
import { useRepo } from '@/data/RepoContext';
import type { LeaveImportPlan } from '@/data/leaveImport';

const input = 'rounded border border-slate-300 px-2 py-1 text-sm';
const btn = 'rounded-lg px-3 py-1.5 text-sm font-semibold';

/** Leave entry (§4.8): a single date-range, plus bulk paste/CSV import with a
 *  preview before commit. Leave is full-day in v1. */
export function LeaveTab({ resources }: { resources: Resource[] }) {
  const repo = useRepo();
  const [rid, setRid] = useState(resources[0]?.id ?? '');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [status, setStatus] = useState('');
  const [text, setText] = useState('');
  const [plan, setPlan] = useState<LeaveImportPlan | null>(null);

  async function applyRange(onLeave: boolean) {
    if (!rid || !start) { setStatus('Pick a resource and start date'); return; }
    const e = end || start;
    if (e < start) { setStatus('End is before start'); return; }
    await repo.setLeaveRange(rid, start, e, onLeave);
    const name = resources.find((r) => r.id === rid)?.name ?? '';
    setStatus(`${onLeave ? 'Marked' : 'Cleared'} ${name}: ${start}${e !== start ? ` → ${e}` : ''}`);
  }
  async function preview() { setPlan(await repo.planLeaveImport(text)); }
  async function commit() {
    if (!plan) return;
    await repo.commitLeaveImport(plan);
    setStatus(`Imported ${plan.days.length} leave day${plan.days.length === 1 ? '' : 's'}`);
    setPlan(null);
    setText('');
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 text-xs font-bold uppercase text-slate-500">Mark a range</div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={rid} onChange={(e) => setRid(e.target.value)} className={input}>
            {resources.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={input} />
          <span className="text-slate-400">→</span>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className={input} />
          <button onClick={() => applyRange(true)} className={`${btn} bg-blue-600 text-white hover:bg-blue-700`}>On leave</button>
          <button onClick={() => applyRange(false)} className={`${btn} border border-slate-300 text-slate-700 hover:bg-slate-100`}>Clear</button>
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs font-bold uppercase text-slate-500">Bulk paste / CSV</div>
        <p className="mb-1 text-xs text-slate-400">One per line: <code>Name, start, end</code> (end optional). Dates: 2026-08-11 or 11/08/2026.</p>
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setPlan(null); }}
          rows={5}
          placeholder={'Chris Chamberlain, 2026-08-11, 2026-08-13\nSam Tan, 11/08/2026'}
          className="w-full rounded border border-slate-300 p-2 font-mono text-xs"
        />
        <div className="mt-2 flex items-center gap-2">
          <button onClick={preview} disabled={!text.trim()} className={`${btn} border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40`}>Preview</button>
          {plan && (
            <button onClick={commit} disabled={!plan.days.length} className={`${btn} bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40`}>
              Import {plan.days.length} day{plan.days.length === 1 ? '' : 's'}
            </button>
          )}
        </div>
        {plan && (
          <div className="mt-2 rounded border border-slate-200 p-2 text-xs">
            <div className="font-semibold text-slate-700">
              {plan.days.length} leave day{plan.days.length === 1 ? '' : 's'} from {plan.rowsParsed} row{plan.rowsParsed === 1 ? '' : 's'}
              {plan.unmatched.length > 0 && `, ${plan.unmatched.length} unmatched`}
            </div>
            {plan.unmatched.length > 0 && (
              <div className="mt-1 text-red-600">Unmatched: {plan.unmatched.map((u) => `${u.raw} (${u.reason})`).join('; ')}</div>
            )}
          </div>
        )}
      </div>

      {status && <div className="text-sm text-emerald-700">{status}</div>}
    </div>
  );
}
