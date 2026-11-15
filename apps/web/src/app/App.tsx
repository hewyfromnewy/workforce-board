import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { MultiBackend, MouseTransition, TouchTransition } from 'react-dnd-multi-backend';
import { Toaster } from 'sonner';
import { HistoryPage } from '@/app/components/HistoryPage';
import { ManagePage } from '@/app/components/ManagePage';
import { RosterView } from '@/app/components/RosterView';
import { SettingsPage } from '@/app/components/SettingsPage';
import { Sidebar } from '@/app/components/Sidebar';
import type { View } from '@/app/components/Sidebar';
import { AccessProvider, useAccess } from '@/app/access';
import { UsersPage } from '@/app/components/UsersPage';
import { useStore } from '@/app/store';

const dndBackends = {
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
  return (
    <AccessProvider>
      <Board />
    </AccessProvider>
  );
}

function Board() {
  const { tenantId, tenantName } = useAccess();
  const api = useStore(tenantId);
  const [view, setView] = useState<View>('roster');
  const [menuOpen, setMenuOpen] = useState(false);
  const [date, setDate] = useState(new Date());

  const navigate = (next: View) => {
    setView(next);
    setMenuOpen(false);
  };

  return (
    <DndProvider backend={MultiBackend} options={dndBackends}>
      <div className="h-screen flex flex-col lg:flex-row bg-gray-50">
        <Sidebar
          orgName={tenantName ?? api.store.orgName}
          view={view}
          open={menuOpen}
          onOpenChange={setMenuOpen}
          onNavigate={navigate}
        />
        <main className="flex-1 min-w-0 overflow-hidden">
          {view === 'roster' && <RosterView api={api} date={date} onDateChange={setDate} />}
          {view === 'manage' && <ManagePage api={api} />}
          {view === 'users' && <UsersPage />}
          {view === 'history' && (
            <HistoryPage
              api={api}
              onOpenDay={d => {
                setDate(d);
                navigate('roster');
              }}
            />
          )}
          {view === 'settings' && <SettingsPage api={api} />}
        </main>
        <Toaster position="top-right" />
      </div>
    </DndProvider>
  );
}
