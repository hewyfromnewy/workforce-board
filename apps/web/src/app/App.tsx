import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { MultiBackend, MouseTransition, TouchTransition } from 'react-dnd-multi-backend';
import { RosterBoard } from '@/app/components/RosterBoard';
import { Toaster } from 'sonner';

// Configure multi-backend for both mouse and touch support
const HTML5toTouch = {
  backends: [
    {
      id: 'html5',
      backend: HTML5Backend,
      transition: MouseTransition,
    },
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
  return (
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      <div className="size-full bg-gray-50">
        <RosterBoard />
        <Toaster position="top-right" />
      </div>
    </DndProvider>
  );
}
