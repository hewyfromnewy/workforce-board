import { useState } from 'react';
import { supabase } from '@/app/supabase';

const demoPassword = 'demo-password-1';

const demoAccounts = [
  { label: 'Admin', email: 'admin@example.com' },
  { label: 'Supervisor', email: 'supervisor@example.com' },
  { label: 'Team Member', email: 'member@example.com' },
  { label: 'No team', email: 'platform@example.com' },
];

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState('');

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false } });
    setCodeSent(true);
    setError('');
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error: failure } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' });
    setError(failure ? 'That code is not right or has expired. Check it, or go back and ask for a new one.' : '');
  };

  const demoSignIn = async (demoEmail: string) => {
    await supabase.auth.signInWithPassword({ email: demoEmail, password: demoPassword });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow border border-gray-200 p-6 space-y-4">
        <h1 className="text-xl font-bold">Daily Roster Board</h1>
        {codeSent ? (
          <form onSubmit={verify} className="space-y-3">
            <p className="text-sm text-gray-600">
              If {email.trim()} has an account, we have sent it a 6-digit code. It can take a minute to arrive.
            </p>
            <div className="space-y-1">
              <label htmlFor="code" className="text-sm font-medium">Sign-in code</label>
              <input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg tracking-widest text-lg"
              />
            </div>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button type="submit" className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Sign in</button>
            <button
              type="button"
              onClick={() => { setCodeSent(false); setCode(''); setError(''); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Use a different email
            </button>
          </form>
        ) : (
          <form onSubmit={sendCode} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <button type="submit" className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Send me a code</button>
          </form>
        )}
        {import.meta.env.DEV && (
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <p className="text-sm text-gray-500">Demo accounts (local only)</p>
            <div className="flex flex-wrap gap-2">
              {demoAccounts.map(a => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => demoSignIn(a.email)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100"
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
