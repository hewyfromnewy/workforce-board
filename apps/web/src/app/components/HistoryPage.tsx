import { format, parseISO } from 'date-fns';
import type { StoreApi } from '@/app/store';
import { statusOf } from '@/app/store';
import { StatusBadge } from './StatusBadge';

interface HistoryPageProps {
  api: StoreApi;
  onOpenDay: (date: Date) => void;
}

export function HistoryPage({ api, onOpenDay }: HistoryPageProps) {
  const sentDays = Object.values(api.store.days)
    .filter(d => d.sent)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="h-full overflow-auto">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">Sent history</h1>
        <p className="text-sm text-gray-500">Every day you have sent a roster for.</p>
      </header>
      <div className="p-4">
        {sentDays.length === 0 ? (
          <p className="text-gray-500">Nothing sent yet. Send a roster from the Roster page and it will appear here.</p>
        ) : (
          <ul className="bg-white rounded-lg shadow border border-gray-200 divide-y divide-gray-100">
            {sentDays.map(day => (
              <li key={day.date} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="font-medium mr-auto">{format(parseISO(day.date), 'EEEE d MMMM yyyy')}</span>
                <span className="text-sm text-gray-500">{day.assignments.length} allocations</span>
                <StatusBadge status={statusOf(day)} day={day} />
                <button
                  type="button"
                  onClick={() => onOpenDay(parseISO(day.date))}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
                >
                  Open {format(parseISO(day.date), 'd MMM')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
