import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { supabase } from '../supabase';

interface TenantRow {
  id: string;
  name: string;
  status: 'active' | 'suspended';
  created_at: string;
  memberships: { count: number }[];
}

export function TenantsPage() {
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    const { data } = await supabase
      .from('tenants')
      .select('id, name, status, created_at, memberships(count)')
      .order('created_at', { ascending: false });
    setTenants(data as unknown as TenantRow[]);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = name.trim();
    if (!clean) return;
    const { error } = await supabase.from('tenants').insert({ name: clean });
    if (error) {
      setMessage(`Could not add ${clean}. ${error.message}`);
      return;
    }
    setMessage(`Added ${clean}`);
    setName('');
    load();
  };

  const toggle = async (tenant: TenantRow) => {
    const status = tenant.status === 'active' ? 'suspended' : 'active';
    await supabase.from('tenants').update({ status }).eq('id', tenant.id);
    setMessage(`${tenant.name} is now ${status}`);
    load();
  };

  return (
    <>
      <PageHeader title="Tenants" description="Organisations that use the roster board." />
      <div className="p-6 space-y-4">
        <form onSubmit={add} className="flex flex-wrap gap-2">
          <label htmlFor="tenant-name" className="sr-only">New tenant name</label>
          <input
            id="tenant-name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="New tenant name"
            className="flex-1 min-w-48 px-3 py-2 border border-slate-300 rounded-lg bg-white"
          />
          <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
            <Plus className="w-4 h-4" aria-hidden />
            Add tenant
          </button>
        </form>
        <p role="status" className="text-sm text-slate-600 min-h-5">{message}</p>
        <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
          <table aria-label="Tenants" className="w-full text-sm">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th scope="col" className="px-4 py-2 font-semibold">Name</th>
                <th scope="col" className="px-4 py-2 font-semibold">Status</th>
                <th scope="col" className="px-4 py-2 font-semibold">Users</th>
                <th scope="col" className="px-4 py-2 font-semibold">Created</th>
                <th scope="col" className="px-4 py-2"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map(t => (
                <tr key={t.id}>
                  <th scope="row" className="px-4 py-2 text-left font-medium">{t.name}</th>
                  <td className="px-4 py-2">{t.status === 'active' ? 'Active' : 'Suspended'}</td>
                  <td className="px-4 py-2">{t.memberships[0].count}</td>
                  <td className="px-4 py-2">{new Date(t.created_at).toLocaleDateString('en-AU')}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => toggle(t)}
                      className="px-3 py-1 border border-slate-300 rounded-lg hover:bg-slate-100"
                    >
                      {t.status === 'active' ? `Suspend ${t.name}` : `Reactivate ${t.name}`}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
