import { format } from 'date-fns';
import type { CopyPlan } from '@/data/copyForward';

const fmt = (d: string) => format(new Date(`${d}T00:00:00`), 'EEE dd/MM');

/** Preview of a copy-forward before commit (§4.5). Shows what will be added and
 *  what's skipped because the target has leave/training that's respected. */
export function CopyPreviewModal({
  plan,
  onCancel,
  onConfirm,
}: {
  plan: CopyPlan;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const range = plan.days > 1
    ? `week of ${fmt(plan.fromDate)} → week of ${fmt(plan.toDate)}`
    : `${fmt(plan.fromDate)} → ${fmt(plan.toDate)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[80vh] w-full max-w-md flex-col rounded-xl bg-white shadow-xl">
        <div className="border-b border-slate-200 p-4">
          <h3 className="text-base font-bold text-slate-900">Copy forward — {range}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {plan.adds.length} placement{plan.adds.length === 1 ? '' : 's'} to copy
            {plan.skipped.length > 0 && `, ${plan.skipped.length} skipped (leave/training respected)`}.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4 text-sm">
          {plan.adds.length === 0 ? (
            <p className="text-slate-400">Nothing to copy.</p>
          ) : (
            <ul className="space-y-0.5">
              {plan.adds.map((r, i) => (
                <li key={`${r.resourceId}-${r.date}-${r.slot}-${i}`} className="flex justify-between gap-2">
                  <span className="font-medium text-slate-800">{r.resourceName}</span>
                  <span className="text-slate-500">
                    {r.destLabel}
                    {r.slot !== 'full' && <span className="ml-1 font-semibold uppercase">{r.slot}</span>}
                    {plan.days > 1 && <span className="ml-1 text-slate-400">· {fmt(r.date)}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {plan.skipped.length > 0 && (
            <div className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-400">
              Skipped: {plan.skipped.map((s) => `${s.resourceName} (${s.reason})`).join(', ')}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 p-4">
          <button onClick={onCancel} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={plan.adds.length === 0}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
          >
            Copy {plan.adds.length} forward
          </button>
        </div>
      </div>
    </div>
  );
}
