import { Check } from 'lucide-react';
import { DEFAULT_ROLES, PERMISSIONS } from '@workforce/shared';
import { PageHeader } from './PageHeader';

export function RolesPage() {
  return (
    <>
      <PageHeader
        title="Roles and permissions"
        description="The default roles every tenant starts with. Tenant admins assign these to their users."
      />
      <div className="p-6">
        <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
          <table aria-label="Role permissions" className="w-full text-sm">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th scope="col" className="px-4 py-2 font-semibold">Permission</th>
                {DEFAULT_ROLES.map(role => (
                  <th key={role.id} scope="col" className="px-4 py-2 font-semibold text-center">
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PERMISSIONS.map(permission => (
                <tr key={permission}>
                  <th scope="row" className="px-4 py-2 text-left font-mono font-normal">
                    {permission}
                  </th>
                  {DEFAULT_ROLES.map(role => (
                    <td key={role.id} className="px-4 py-2 text-center">
                      {role.permissions.includes(permission) ? (
                        <Check className="w-4 h-4 inline text-green-600" aria-label="Allowed" />
                      ) : (
                        <span className="text-slate-300" aria-label="Not allowed">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
