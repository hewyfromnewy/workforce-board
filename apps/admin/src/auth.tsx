import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { LoginPage } from './pages/LoginPage';
import { supabase } from './supabase';

type State =
  | { status: 'loading' }
  | { status: 'signed-out' }
  | { status: 'denied'; email: string }
  | { status: 'ready'; email: string };

export const signOut = () => {
  supabase.auth.signOut();
};

export function AuthGate({ children }: { children: (email: string) => ReactNode }) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(async () => {
        if (!session) {
          setState({ status: 'signed-out' });
          return;
        }
        const { data: admin } = await supabase.from('platform_admins').select('user_id').maybeSingle();
        const email = session.user.email ?? '';
        setState(admin ? { status: 'ready', email } : { status: 'denied', email });
      }, 0);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (state.status === 'loading') {
    return <p className="p-6 text-slate-500">Loading...</p>;
  }
  if (state.status === 'signed-out') {
    return <LoginPage />;
  }
  if (state.status === 'denied') {
    return (
      <div className="p-6 space-y-3">
        <h1 className="text-xl font-bold">No access</h1>
        <p>{state.email} is not a platform admin.</p>
        <button type="button" onClick={signOut} className="px-4 py-2 border border-slate-300 rounded-lg">
          Sign out
        </button>
      </div>
    );
  }
  return <>{children(state.email)}</>;
}
