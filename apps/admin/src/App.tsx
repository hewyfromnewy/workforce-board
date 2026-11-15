import { useState } from 'react';
import { Building2, LogOut, ShieldCheck, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { AuthGate, signOut } from './auth';
import { RolesPage } from './pages/RolesPage';
import { TenantsPage } from './pages/TenantsPage';
import { UsersPage } from './pages/UsersPage';

type View = 'tenants' | 'users' | 'roles';

const items: { view: View; label: string; icon: ReactNode }[] = [
  { view: 'tenants', label: 'Tenants', icon: <Building2 className="w-5 h-5" aria-hidden /> },
  { view: 'users', label: 'Users', icon: <Users className="w-5 h-5" aria-hidden /> },
  { view: 'roles', label: 'Roles and permissions', icon: <ShieldCheck className="w-5 h-5" aria-hidden /> },
];

export default function App() {
  return <AuthGate>{email => <Shell email={email} />}</AuthGate>;
}

function Shell({ email }: { email: string }) {
  const [view, setView] = useState<View>('tenants');

  return (
    <div className="h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900">
      <nav aria-label="Main" className="md:w-60 shrink-0 bg-slate-900 text-white flex flex-col">
        <div className="px-4 py-4 border-b border-slate-800">
          <p className="font-bold">Roster Board</p>
          <p className="text-sm text-slate-400">Platform admin</p>
        </div>
        <ul className="p-2 flex md:flex-col gap-1 overflow-x-auto">
          {items.map(item => (
            <li key={item.view}>
              <button
                type="button"
                aria-current={view === item.view ? 'page' : undefined}
                onClick={() => setView(item.view)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left whitespace-nowrap ${
                  view === item.view ? 'bg-indigo-600' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="hidden md:block mt-auto border-t border-slate-800 p-4 text-sm">
          <p className="text-slate-400">{email}</p>
          <button type="button" onClick={signOut} className="mt-2 flex items-center gap-2 text-slate-300 hover:text-white">
            <LogOut className="w-4 h-4" aria-hidden />
            Sign out
          </button>
        </div>
      </nav>
      <main className="flex-1 min-w-0 overflow-auto">
        {view === 'tenants' && <TenantsPage />}
        {view === 'users' && <UsersPage />}
        {view === 'roles' && <RolesPage />}
      </main>
    </div>
  );
}
