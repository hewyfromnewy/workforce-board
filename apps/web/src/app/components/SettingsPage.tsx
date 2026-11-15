import { toast } from 'sonner';
import { useAccess } from '@/app/access';
import type { StoreApi } from '@/app/store';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/app/components/ui/alert-dialog';

export function SettingsPage({ api }: { api: StoreApi }) {
  const { tenantName } = useAccess();
  return (
    <div className="h-full overflow-auto">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
      </header>
      <div className="p-4 space-y-4 max-w-2xl">
        {tenantName === null && (
        <section className="bg-white rounded-lg shadow border border-gray-200 p-4 space-y-2">
          <label htmlFor="org-name" className="font-semibold text-gray-900">
            Organisation name
          </label>
          <p className="text-sm text-gray-500">Shown at the top of the menu.</p>
          <input
            id="org-name"
            value={api.store.orgName}
            onChange={e => api.setOrgName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </section>
        )}

        <section className="bg-white rounded-lg shadow border border-gray-200 p-4 space-y-2">
          <h2 className="font-semibold text-gray-900">How this works</h2>
          <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
            <li>Pick a day, then drag people and assets from "Not on the roster" into a location and category.</li>
            <li>Use the cross on a tag to take it off the roster again.</li>
            <li>Send copies the roster or opens WhatsApp, and marks the day as sent.</li>
            <li>If you change a roster after sending it, it shows as changed so you know to send it again.</li>
            <li>Your data is saved in this browser on this device only. It does not sync to other devices yet.</li>
          </ul>
        </section>

        <section className="bg-white rounded-lg shadow border border-red-200 p-4 space-y-2">
          <h2 className="font-semibold text-gray-900">Reset</h2>
          <p className="text-sm text-gray-500">Removes every roster and restores the example people, assets and locations.</p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button type="button" className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50">
                Reset all data
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This deletes every roster and sent record in this browser. It cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep my data</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    api.resetAll();
                    toast.success('All data reset');
                  }}
                >
                  Reset everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
      </div>
    </div>
  );
}
