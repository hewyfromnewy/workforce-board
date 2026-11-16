import { useEffect, useState } from 'react';
import { addDays, format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { dayKey } from '@/app/store';

interface CopyDayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: Date;
  hasContent: boolean;
  onCopy: (from: string) => Promise<void>;
}

export function CopyDayDialog({ open, onOpenChange, target, hasContent, onCopy }: CopyDayDialogProps) {
  const previous = dayKey(addDays(target, -1));
  const [from, setFrom] = useState(previous);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setFrom(previous);
  }, [open, previous]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Copy from another day</DialogTitle>
          <DialogDescription>
            Bring the people, assets, notes and supervisors from a day into {format(target, 'EEEE d MMMM')}. It starts from the day before.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={async e => {
            e.preventDefault();
            setBusy(true);
            await onCopy(from);
            setBusy(false);
          }}
          className="space-y-3"
        >
          <div className="space-y-1">
            <label htmlFor="copy-from" className="text-sm font-medium">Copy from</label>
            <input
              id="copy-from"
              type="date"
              value={from}
              onChange={e => setFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
            />
          </div>
          {hasContent && (
            <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              This day already has a roster. Copying replaces it.
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy || !from || from === dayKey(target)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
            >
              {hasContent ? 'Replace with copy' : 'Copy roster'}
            </button>
            <button type="button" onClick={() => onOpenChange(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
              Cancel
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
