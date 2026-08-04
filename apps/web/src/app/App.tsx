import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { MultiBackend, MouseTransition, TouchTransition } from 'react-dnd-multi-backend';
import { format } from 'date-fns';
import { RepoProvider } from '@/data/RepoContext';
import { BoardHeader } from '@/app/board/BoardHeader';
import { DailyBoard } from '@/app/board/DailyBoard';

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

  return (
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      <RepoProvider>
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">
          <BoardHeader date={date} onDateChange={setDate} />
          <DailyBoard date={date} />
        </div>
      </RepoProvider>
    </DndProvider>
  );
}
