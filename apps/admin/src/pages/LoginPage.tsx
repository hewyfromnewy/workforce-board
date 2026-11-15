import { useState } from 'react';
import { supabase } from '../supabase';

const demoPassword = 'demo-password-1';

const demoAccounts = [
  { label: 'Platform admin', email: 'platform@example.com' },
  { label: 'Tenant admin (no access)', email: 'admin@example.com' },
];

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const signIn = async (e: string, p: string) => {
    const { error: failure } = await supabase.auth.signInWithPassword({ email: e, password: p });
    setError(failure ? 'That email or password is not right. Check them and try again.' : '');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow border border-slate-200 p-6 space-y-4">
        <h1 className="text-xl font-bold">Roster Board Admin</h1>
        <form
          onSubmit={e => {
            e.preventDefault();
            signIn(email, password);
          }}
          className="space-y-3"
        >
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button type="submit" className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Sign in</button>
        </form>
        {import.meta.env.DEV && (
          <div className="border-t border-slate-200 pt-4 space-y-2">
            <p className="text-sm text-slate-500">Demo accounts (local only)</p>
            <div className="flex flex-wrap gap-2">
              {demoAccounts.map(a => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => signIn(a.email, demoPassword)}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-100"
                >
                  Sign in as {a.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
