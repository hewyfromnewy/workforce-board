import { format, addDays } from 'date-fns';

export type BoardView = 'weekly' | 'daily';

/** Board header: title, Weekly/Daily toggle, and date navigation. */
export function BoardHeader({
  date,
  onDateChange,
  view,
  onViewChange,
}: {
  date: string;
  onDateChange: (date: string) => void;
  view: BoardView;
  onViewChange: (view: BoardView) => void;
}) {
  const step = view === 'weekly' ? 7 : 1;
  const label = format(new Date(`${date}T00:00:00`), 'EEE dd/MM/yy');
  const shift = (n: number) =>
    onDateChange(format(addDays(new Date(`${date}T00:00:00`), n), 'yyyy-MM-dd'));

  return (
    <header className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-800 pb-3">
      <div>
        <h1 className="text-xl font-black tracking-tight text-slate-900">Crew &amp; Plant Planner</h1>
        <p className="text-sm text-slate-500">Road Construction · DB-free preview</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex overflow-hidden rounded-lg border border-slate-300">
          {(['weekly', 'daily'] as const).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={`px-3 py-1.5 text-sm font-semibold capitalize ${view === v ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => shift(-step)} className="rounded border border-slate-300 px-2 py-1 text-sm hover:bg-slate-100">‹</button>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="rounded border border-slate-300 px-2 py-1 text-sm font-medium"
          />
          <span className="text-sm font-semibold text-slate-700">{view === 'weekly' ? `week of ${label}` : label}</span>
          <button onClick={() => shift(step)} className="rounded border border-slate-300 px-2 py-1 text-sm hover:bg-slate-100">›</button>
        </div>
      </div>
    </header>
  );
}
