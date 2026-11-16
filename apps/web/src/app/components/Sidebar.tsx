import { CalendarDays, ChevronsLeft, ChevronsRight, CircleHelp, History, LogOut, Menu, Settings, UserCog, Users, X } from 'lucide-react';
import type { Permission } from '@workforce/shared';
import { useAccess } from '@/app/access';
import { useState } from 'react';
import type { ReactNode } from 'react';

export type View = 'roster' | 'manage' | 'users' | 'history' | 'settings' | 'help';

const items: { view: View; label: string; icon: ReactNode; permission?: Permission }[] = [
  { view: 'roster', label: 'Roster', icon: <CalendarDays className="w-5 h-5" aria-hidden /> },
  { view: 'manage', label: 'Manage', icon: <Users className="w-5 h-5" aria-hidden />, permission: 'master_data.manage' },
  { view: 'users', label: 'Users', icon: <UserCog className="w-5 h-5" aria-hidden />, permission: 'users.manage' },
  { view: 'history', label: 'Sent history', icon: <History className="w-5 h-5" aria-hidden /> },
  { view: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" aria-hidden /> },
  { view: 'help', label: 'Help', icon: <CircleHelp className="w-5 h-5" aria-hidden /> },
];

const collapsedKey = 'workforce-board-menu-collapsed';

interface SidebarProps {
  orgName: string;
  view: View;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (view: View) => void;
}

export function Sidebar({ orgName, view, open, onOpenChange, onNavigate }: SidebarProps) {
  const { can, user, signOut } = useAccess();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(collapsedKey) === 'true');
  const toggle = () => {
    localStorage.setItem(collapsedKey, String(!collapsed));
    setCollapsed(!collapsed);
  };
  const rail = collapsed ? 'lg:w-14' : 'lg:w-56';
  const hide = collapsed ? 'lg:hidden' : '';
  return (
    <>
      <div className="lg:hidden flex items-center gap-3 bg-gray-900 text-white px-4 py-3">
        <button type="button" aria-label="Open menu" onClick={() => onOpenChange(true)}>
          <Menu className="w-6 h-6" aria-hidden />
        </button>
        <span className="font-semibold">Daily Roster Board</span>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => onOpenChange(false)} aria-hidden />
      )}

      <nav
        aria-label="Main"
        className={`fixed lg:static inset-y-0 left-0 z-50 w-56 ${rail} shrink-0 bg-gray-900 text-white flex flex-col transition-transform ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className={`py-4 flex items-start justify-between border-b border-gray-800 ${collapsed ? 'px-4 lg:px-2 lg:justify-center' : 'px-4'}`}>
          <div className={hide}>
            <p className="font-bold">Daily Roster Board</p>
            <p className="text-sm text-gray-400">{orgName}</p>
          </div>
          <button
            type="button"
            className="hidden lg:block p-1 rounded text-gray-300 hover:bg-gray-800 hover:text-white"
            aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
            aria-expanded={!collapsed}
            title={collapsed ? 'Expand menu' : 'Collapse menu'}
            onClick={toggle}
          >
            {collapsed ? <ChevronsRight className="w-5 h-5" aria-hidden /> : <ChevronsLeft className="w-5 h-5" aria-hidden />}
          </button>
          <button type="button" className="lg:hidden" aria-label="Close menu" onClick={() => onOpenChange(false)}>
            <X className="w-5 h-5" aria-hidden />
          </button>
        </div>
        <ul className="p-2 space-y-1">
          {items.filter(item => !item.permission || can(item.permission)).map(item => (
            <li key={item.view}>
              <button
                type="button"
                data-tour={`nav-${item.view}`}
                aria-current={view === item.view ? 'page' : undefined}
                aria-label={item.label}
                title={collapsed ? item.label : undefined}
                onClick={() => onNavigate(item.view)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${collapsed ? 'lg:justify-center lg:px-2' : ''} ${
                  view === item.view ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                {item.icon}
                <span className={hide}>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
        {user && (
          <div className={`mt-auto border-t border-gray-800 p-4 text-sm ${collapsed ? 'lg:px-2' : ''}`}>
            <div className={hide}>
              <p className="font-medium">{user.name}</p>
              <p className="text-gray-400">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={signOut}
              aria-label="Sign out"
              title={collapsed ? 'Sign out' : undefined}
              className={`mt-2 flex items-center gap-2 text-gray-300 hover:text-white ${collapsed ? 'lg:justify-center lg:w-full' : ''}`}
            >
              <LogOut className="w-4 h-4" aria-hidden />
              <span className={hide}>Sign out</span>
            </button>
          </div>
        )}
      </nav>
    </>
  );
}
