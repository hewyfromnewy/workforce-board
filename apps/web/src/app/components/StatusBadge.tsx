import { format } from 'date-fns';
import type { RosterDay, RosterStatus } from '@workforce/shared';

const styles: Record<RosterStatus, string> = {
  draft: 'bg-gray-100 text-gray-700 border-gray-300',
  sent: 'bg-green-100 text-green-800 border-green-300',
  changed: 'bg-amber-100 text-amber-900 border-amber-300',
};

export function statusLabel(status: RosterStatus, day: RosterDay) {
  if (status === 'draft') return 'Draft: not sent';
  const at = format(new Date(day.sent!.at), 'h:mm a');
  return status === 'sent' ? `Sent at ${at}` : `Changed since sent at ${at}`;
}

export function StatusBadge({ status, day }: { status: RosterStatus; day: RosterDay }) {
  return (
    <span
      role="status"
      data-status={status}
      className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium ${styles[status]}`}
    >
      {statusLabel(status, day)}
    </span>
  );
}
