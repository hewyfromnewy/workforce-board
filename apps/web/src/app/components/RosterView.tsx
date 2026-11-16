import { useEffect, useState } from 'react';
import { addDays, format, isToday, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Copy, Send } from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_CATEGORIES } from '@workforce/shared';
import { useAccess } from '@/app/access';
import { rosterText } from '@/app/rosterText';
import { dayKey, statusOf } from '@/app/store';
import type { StoreApi } from '@/app/store';
import { CopyDayDialog } from './CopyDayDialog';
import { HoldingArea } from './HoldingArea';
import { RosterGrid } from './RosterGrid';
import { SendDialog } from './SendDialog';
import { StatusBadge } from './StatusBadge';
import { SupervisorsBar } from './SupervisorsBar';

interface RosterViewProps {
  api: StoreApi;
  date: Date;
  onDateChange: (date: Date) => void;
  onOpenManage: () => void;
  showTourPrompt: boolean;
  onStartTour: () => void;
  onDismissTourPrompt: () => void;
}

const navButton = 'p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100';

export function RosterView({ api, date, onDateChange, onOpenManage, showTourPrompt, onStartTour, onDismissTourPrompt }: RosterViewProps) {
  const [sendOpen, setSendOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const { can } = useAccess();
  const { store } = api;
  const key = dayKey(date);
  useEffect(() => {
    api.loadDay(key);
  }, [key, api.loading]);
  const day = api.getDay(key);
  const status = statusOf(day);
  const tagById = new Map(store.tags.map(t => [t.id, t]));
  const assigned = new Set([...day.assignments.map(a => a.tagId), ...day.supervisorIds]);
  const waiting = store.tags.filter(t => !assigned.has(t.id));
  const supervisors = day.supervisorIds.map(id => tagById.get(id)!);
  const text = rosterText(date, day, store.tags, store.jobs);

  const send = (method: 'copy' | 'whatsapp') => {
    if (method === 'copy') {
      navigator.clipboard.writeText(text);
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
    api.markSent(key);
    setSendOpen(false);
    toast.success(method === 'copy' ? 'Roster copied and marked as sent' : 'Opened WhatsApp and marked as sent');
  };

  if (api.loading) {
    return <p className="p-6 text-gray-500">Loading the roster...</p>;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold text-gray-900 mr-auto">
          Roster for {format(date, 'EEEE d MMMM')}
        </h1>
        <div data-tour="date" className="flex items-center gap-1">
          <button type="button" className={navButton} aria-label="Previous day" onClick={() => onDateChange(addDays(date, -1))}>
            <ChevronLeft className="w-4 h-4" aria-hidden />
          </button>
          <input
            type="date"
            aria-label="Roster date"
            value={key}
            onChange={e => e.target.value && onDateChange(parseISO(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          />
          <button type="button" className={navButton} aria-label="Next day" onClick={() => onDateChange(addDays(date, 1))}>
            <ChevronRight className="w-4 h-4" aria-hidden />
          </button>
          <button
            type="button"
            disabled={isToday(date)}
            onClick={() => onDateChange(new Date())}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
          >
            Today
          </button>
        </div>
        {can('roster.edit') && (
          <button
            type="button"
            onClick={() => setCopyOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-100"
          >
            <Copy className="w-4 h-4" aria-hidden />
            Copy from another day
          </button>
        )}
        <div data-tour="send" className="flex items-center gap-3">
        <StatusBadge status={status} day={day} />
        {can('roster.send') && (
        <button
          type="button"
          onClick={() => setSendOpen(true)}
          disabled={day.assignments.length === 0 && day.supervisorIds.length === 0}
          title={day.assignments.length === 0 && day.supervisorIds.length === 0 ? 'Add people or assets to the roster first' : undefined}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow disabled:opacity-50 disabled:hover:bg-blue-600"
        >
          <Send className="w-4 h-4" aria-hidden />
          {status === 'changed' ? 'Send again' : 'Send'}
        </button>
        )}
        </div>
      </header>

      {showTourPrompt && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex flex-wrap items-center gap-3 text-sm text-blue-900">
          <span className="mr-auto">New here? Take a one-minute tour of the board.</span>
          <button type="button" onClick={onStartTour} className="rounded-lg bg-blue-600 px-3 py-1 text-white hover:bg-blue-700">
            Take the tour
          </button>
          <button type="button" onClick={onDismissTourPrompt} className="rounded-lg border border-blue-300 px-3 py-1 hover:bg-blue-100">
            Not now
          </button>
        </div>
      )}

      {!can('roster.edit') && (
        <p className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-sm text-blue-900">You can view this roster but not change it.</p>
      )}

      {status === 'changed' && can('roster.send') && (
        <div role="alert" className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm text-amber-900">
          This roster has changed since you sent it. People you already sent it to will not see these changes until you send it again.
        </div>
      )}

      {!api.dayLoaded(key) ? (
        <p className="p-6 text-gray-500">Loading this day...</p>
      ) : store.jobs.length === 0 ? (
        <div className="m-4 rounded-lg border border-gray-200 bg-white p-6 space-y-2">
          <h2 className="font-semibold text-gray-900">Your board is empty</h2>
          <p className="text-gray-600">
            {can('master_data.manage')
              ? 'Add your locations, team members and plant in Manage. You can paste a whole list at once.'
              : 'Ask your admin to add locations, team members and plant in Manage.'}
          </p>
          {can('master_data.manage') && (
            <button type="button" onClick={onOpenManage} className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Open Manage
            </button>
          )}
        </div>
      ) : (
        <>
      <SupervisorsBar
        tags={supervisors}
        onSet={tagId => api.setSupervisor(key, tagId)}
        onUnassign={tagId => api.unassign(key, tagId)}
      />

      <div className="flex-1 overflow-auto lg:overflow-hidden flex flex-col lg:flex-row gap-4 p-4">
        <div data-tour="board" className="shrink-0 lg:shrink lg:flex-1 overflow-auto max-h-[75vh] lg:max-h-none bg-white rounded-lg shadow border border-gray-200">
          <RosterGrid
            categories={DEFAULT_CATEGORIES}
            jobs={store.jobs}
            assignments={day.assignments}
            notes={day.notes}
            tagById={tagById}
            onAssign={(tagId, categoryId, jobId) => api.assign(key, tagId, categoryId, jobId)}
            onUnassign={tagId => api.unassign(key, tagId)}
            onNote={(jobId, categoryId, text) => api.setNote(key, jobId, categoryId, text)}
          />
        </div>
        <HoldingArea tags={waiting} tagById={tagById} onUnassign={tagId => api.unassign(key, tagId)} />
      </div>
        </>
      )}

      <CopyDayDialog
        open={copyOpen}
        onOpenChange={setCopyOpen}
        target={date}
        hasContent={day.assignments.length > 0 || day.supervisorIds.length > 0 || Object.keys(day.notes).length > 0}
        onCopy={async from => {
          await api.copyDay(from, key);
          setCopyOpen(false);
          toast.success(`Copied the roster from ${format(parseISO(from), 'EEEE d MMMM')}`);
        }}
      />
      <SendDialog open={sendOpen} onOpenChange={setSendOpen} text={text} onSend={send} />
    </div>
  );
}
