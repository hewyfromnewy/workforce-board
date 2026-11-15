import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { DEFAULT_ROLES } from '@workforce/shared';
import { useAccess } from '@/app/access';
import { supabase } from '@/app/supabase';

interface Member {
  user_id: string;
  display_name: string;
  email: string;
  role_id: string;
}

export function UsersPage() {
  const { tenantId } = useAccess();
  const [members, setMembers] = useState<Member[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from('memberships')
      .select('user_id, display_name, email, role_id')
      .eq('tenant_id', tenantId)
      .order('display_name');
    setMembers(data as Member[]);
  };

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (member: Member, roleId: string) => {
    const { error } = await supabase
      .from('memberships')
      .update({ role_id: roleId })
      .eq('tenant_id', tenantId)
      .eq('user_id', member.user_id);
    if (error) {
      toast.error(`Could not change ${member.display_name}'s role`);
      return;
    }
    toast.success(`${member.display_name} is now ${DEFAULT_ROLES.find(r => r.id === roleId)!.name}`);
    load();
  };

  return (
    <div className="h-full overflow-auto">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500">People in your team and what they can do. Adding new users is not available yet.</p>
      </header>
      <div className="p-4">
        <ul className="bg-white rounded-lg shadow border border-gray-200 divide-y divide-gray-100">
          {members.map(m => (
            <li key={m.user_id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="mr-auto">
                <p className="font-medium">{m.display_name}</p>
                <p className="text-sm text-gray-500">{m.email}</p>
              </div>
              <label htmlFor={`role-${m.user_id}`} className="sr-only">Role for {m.display_name}</label>
              <select
                id={`role-${m.user_id}`}
                value={m.role_id}
                onChange={e => changeRole(m, e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                {DEFAULT_ROLES.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
