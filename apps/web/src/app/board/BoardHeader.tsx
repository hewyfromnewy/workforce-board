import { format, addDays } from 'date-fns';

/** Board header: title + date navigation. Date is an ISO `YYYY-MM-DD` string. */
export function BoardHeader({
  date,
  onDateChange,
}: {
  date: string;
  onDateChange: (date: string) => void;
}) {
  const label = format(new Date(`${date}T00:00:00`), 'EEE dd/MM/yy');
  const shift = (days: number) =>
    onDateChange(format(addDays(new Date(`${date}T00:00:00`), days), 'yyyy-MM-dd'));

  return (
    <header className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-800 pb-3">
      <div>
        <h1 className="text-xl font-black tracking-tight text-slate-900">Daily Board — Road Construction</h1>
        <p className="text-sm text-slate-500">Crew &amp; Plant Planner · DB-free preview</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => shift(-1)} className="rounded border border-slate-300 px-2 py-1 text-sm hover:bg-slate-100">‹</button>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="rounded border border-slate-300 px-2 py-1 text-sm font-medium"
        />
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <button onClick={() => shift(1)} className="rounded border border-slate-300 px-2 py-1 text-sm hover:bg-slate-100">›</button>
      </div>
    </header>
  );
}
