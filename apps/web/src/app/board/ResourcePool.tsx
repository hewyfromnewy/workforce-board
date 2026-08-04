import type { AssignmentSlot, Resource } from '@workforce/shared';
import { ResourceTag } from './ResourceTag';
import { Drop } from './DropZone';

/** Unassigned pool — the holding area. Dropping a resource here unassigns it. */
export function ResourcePool({
  resources,
  onDropResource,
}: {
  resources: Resource[];
  onDropResource: (resourceId: string, slot: AssignmentSlot) => void;
}) {
  return (
    <Drop
      onDrop={onDropResource}
      className="w-full shrink-0 self-start rounded-lg border border-slate-300 bg-white p-3 lg:w-72"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold uppercase text-slate-500">Unassigned</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{resources.length}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {resources.length === 0 && <span className="text-sm text-slate-400">— all assigned —</span>}
        {resources.map((r) => (
          <ResourceTag key={r.id} resource={r} />
        ))}
      </div>
    </Drop>
  );
}
