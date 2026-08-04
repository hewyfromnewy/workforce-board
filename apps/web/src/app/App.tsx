import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { MultiBackend, MouseTransition, TouchTransition } from 'react-dnd-multi-backend';
import { format, startOfWeek } from 'date-fns';
import { RepoProvider } from '@/data/RepoContext';
import { BoardHeader, type BoardView } from '@/app/board/BoardHeader';
import { DailyBoard } from '@/app/board/DailyBoard';
import { WeeklyGrid } from '@/app/board/WeeklyGrid';
import { ManagePanel } from '@/app/board/ManagePanel';

const HTML5toTouch = {
  backends: [
    { id: 'html5', backend: HTML5Backend, transition: MouseTransition },
    {
      id: 'touch',
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      preview: true,
      transition: TouchTransition,
    },
  ],
};

export default function App() {
  const [date, setDate] = useState<string>(() => format(new Date(), 'yyyy-MM-dd'));
  const [view, setView] = useState<BoardView>('weekly');
  const [manageOpen, setManageOpen] = useState(false);
  // Bumped when the manage panel closes, to remount the view and re-read data.
  const [dataVersion, setDataVersion] = useState(0);
  const weekStart = format(startOfWeek(new Date(`${date}T00:00:00`), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  return (
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      <RepoProvider>
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">
          <BoardHeader date={date} onDateChange={setDate} view={view} onViewChange={setView} onManage={() => setManageOpen(true)} />
          {view === 'weekly' ? (
            <WeeklyGrid key={dataVersion} startDate={weekStart} />
          ) : (
            <DailyBoard key={dataVersion} date={date} />
          )}
          {manageOpen && (
            <ManagePanel onClose={() => { setManageOpen(false); setDataVersion((v) => v + 1); }} />
          )}
        </div>
      </RepoProvider>
    </DndProvider>
  );
}
