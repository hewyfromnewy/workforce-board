import { useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import type { StoreApi } from '@/app/store';

interface HistoryPageProps {
  api: StoreApi;
  onOpenDay: (date: Date) => void;
}

export function HistoryPage({ api, onOpenDay }: HistoryPageProps) {
  useEffect(() => {
    api.loadHistory();
  }, []);

  return (
    <div className="h-full overflow-auto">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">Sent history</h1>
        <p className="text-sm text-gray-500">Every day you have sent a roster for.</p>
      </header>
      <div className="p-4">
        {api.history.length === 0 ? (
          <p className="text-gray-500">Nothing sent yet. Send a roster from the Roster page and it will appear here.</p>
        ) : (
          <ul className="bg-white rounded-lg shadow border border-gray-200 divide-y divide-gray-100">
            {api.history.map(entry => (
              <li key={entry.date} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="font-medium mr-auto">{format(parseISO(entry.date), 'EEEE d MMMM yyyy')}</span>
                <span className="text-sm text-gray-500">
                  Sent {format(new Date(entry.sent.at), 'h:mm a')}, {entry.sent.assignments.length}{' '}
                  {entry.sent.assignments.length === 1 ? 'allocation' : 'allocations'}
                </span>
                <button
                  type="button"
                  onClick={() => onOpenDay(parseISO(entry.date))}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
                >
                  Open {format(parseISO(entry.date), 'd MMM')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
