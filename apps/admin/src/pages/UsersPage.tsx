import { useEffect, useState } from 'react';
import { DEFAULT_ROLES } from '@workforce/shared';
import { PageHeader } from './PageHeader';
import { supabase } from '../supabase';

interface MemberRow {
  user_id: string;
  tenant_id: string;
  display_name: string;
  email: string;
  role_id: string;
  tenants: { name: string };
}

export function UsersPage() {
  const [members, setMembers] = useState<MemberRow[]>([]);

  useEffect(() => {
    supabase
      .from('memberships')
      .select('user_id, tenant_id, display_name, email, role_id, tenants(name)')
      .order('display_name')
      .then(({ data }) => setMembers(data as unknown as MemberRow[]));
  }, []);

  return (
    <>
      <PageHeader
        title="Users"
        description="Every user across all tenants. Tenant admins manage their own users from the roster app."
      />
      <div className="p-6">
        <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
          <table aria-label="Users" className="w-full text-sm">
            <thead className="bg-slate-100 text-left">
              <tr>
                {['Name', 'Email', 'Tenant', 'Role'].map(c => (
                  <th key={c} scope="col" className="px-4 py-2 font-semibold">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map(m => (
                <tr key={`${m.tenant_id}-${m.user_id}`}>
                  <th scope="row" className="px-4 py-2 text-left font-medium">{m.display_name}</th>
                  <td className="px-4 py-2">{m.email}</td>
                  <td className="px-4 py-2">{m.tenants.name}</td>
                  <td className="px-4 py-2">{DEFAULT_ROLES.find(r => r.id === m.role_id)!.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
