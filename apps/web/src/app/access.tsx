import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Permission } from '@workforce/shared';
import { LoginPage } from '@/app/components/LoginPage';
import { backendEnabled, supabase } from './supabase';

export interface Access {
  tenantId: string;
  tenantName: string | null;
  user: { name: string; email: string; roleId: string } | null;
  can: (permission: Permission) => boolean;
  signOut: () => void;
}

const localAccess: Access = {
  tenantId: 'local',
  tenantName: null,
  user: null,
  can: () => true,
  signOut: () => {},
};

const AccessContext = createContext<Access>(localAccess);

export const useAccess = () => useContext(AccessContext);

interface MembershipRow {
  role_id: string;
  display_name: string;
  email: string;
  tenant_id: string;
  tenants: { name: string };
  roles: { permissions: Permission[] };
}

type State =
  | { status: 'loading' }
  | { status: 'signed-out' }
  | { status: 'no-team'; email: string }
  | { status: 'ready'; access: Access };

const signOut = () => {
  supabase.auth.signOut();
};

function BackendAccess({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(async () => {
        if (!session) {
          setState({ status: 'signed-out' });
          return;
        }
        const { data: row } = await supabase
          .from('memberships')
          .select('role_id, display_name, email, tenant_id, tenants(name), roles(permissions)')
          .eq('user_id', session.user.id)
          .limit(1)
          .maybeSingle();
        const membership = row as unknown as MembershipRow | null;
        if (!membership) {
          setState({ status: 'no-team', email: session.user.email ?? '' });
          return;
        }
        setState({
          status: 'ready',
          access: {
            tenantId: membership.tenant_id,
            tenantName: membership.tenants.name,
            user: { name: membership.display_name, email: membership.email, roleId: membership.role_id },
            can: permission => membership.roles.permissions.includes(permission),
            signOut,
          },
        });
      }, 0);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (state.status === 'loading') {
    return <p className="p-6 text-gray-500">Loading...</p>;
  }
  if (state.status === 'signed-out') {
    return <LoginPage />;
  }
  if (state.status === 'no-team') {
    return (
      <div className="p-6 space-y-3">
        <p>{state.email} is not part of a team yet. Ask your admin to add you.</p>
        <button type="button" onClick={signOut} className="px-4 py-2 border border-gray-300 rounded-lg">
          Sign out
        </button>
      </div>
    );
  }
  return <AccessContext.Provider value={state.access}>{children}</AccessContext.Provider>;
}

export function AccessProvider({ children }: { children: ReactNode }) {
  if (!backendEnabled) {
    return <AccessContext.Provider value={localAccess}>{children}</AccessContext.Provider>;
  }
  return <BackendAccess>{children}</BackendAccess>;
}
