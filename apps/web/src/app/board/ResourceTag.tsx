import { useDrag } from 'react-dnd';
import type { AssignmentSlot, Resource, ResourceType } from '@workforce/shared';

export const RESOURCE_DND = 'RESOURCE';
export interface ResourceDragItem {
  resourceId: string;
}

const COLORS: Record<ResourceType, string> = {
  person: 'bg-amber-100 border-amber-400 text-amber-950',
  plant: 'bg-emerald-100 border-emerald-500 text-emerald-950',
  hire: 'bg-sky-100 border-sky-400 text-sky-950',
  contractor: 'bg-violet-100 border-violet-400 text-violet-950',
};

export function ResourceTag({ resource, slot }: { resource: Resource; slot?: AssignmentSlot }) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: RESOURCE_DND,
      item: { resourceId: resource.id } as ResourceDragItem,
      collect: (m) => ({ isDragging: m.isDragging() }),
    }),
    [resource.id],
  );

  return (
    <span
      ref={drag}
      className={`inline-flex cursor-move items-center gap-1 rounded border px-2 py-0.5 text-sm font-medium ${COLORS[resource.type]} ${isDragging ? 'opacity-40' : ''}`}
    >
      {resource.name}
      {slot && slot !== 'full' && (
        <span className="rounded bg-slate-800 px-1 text-[10px] font-bold uppercase text-white">
          {slot}
        </span>
      )}
    </span>
  );
}
