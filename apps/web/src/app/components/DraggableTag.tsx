import { useDrag, useDrop } from 'react-dnd';
import { X } from 'lucide-react';
import type { Tag } from '@workforce/shared';
import { useAccess } from '@/app/access';

interface DraggableTagProps {
  tag: Tag;
  compact?: boolean;
  crew?: Tag[];
  onCrewDrop?: (tagId: string) => void;
  onCrewRemove?: (tagId: string) => void;
  onRemove?: () => void;
}

interface DragItem {
  id: string;
  type: Tag['type'];
}

const colours: Record<Tag['type'], string> = {
  member: 'bg-amber-100 border-amber-300 text-amber-900',
  asset: 'bg-green-100 border-green-300 text-green-900',
  hire: 'bg-white border-gray-400 text-gray-900',
};

export function DraggableTag({ tag, compact, crew, onCrewDrop, onCrewRemove, onRemove }: DraggableTagProps) {
  const { can } = useAccess();
  const canEdit = can('roster.edit');
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'TAG',
      item: { id: tag.id, type: tag.type } satisfies DragItem,
      canDrag: canEdit,
      collect: monitor => ({ isDragging: monitor.isDragging() }),
    }),
    [tag.id, tag.type, canEdit],
  );
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: 'TAG',
      canDrop: (item: DragItem) => crew !== undefined && item.type === 'member',
      drop: (item: DragItem) => onCrewDrop?.(item.id),
      collect: monitor => ({ isOver: monitor.isOver({ shallow: true }), canDrop: monitor.canDrop() }),
    }),
    [crew !== undefined, onCrewDrop],
  );

  const size = compact ? 'px-2 py-1 text-xs gap-1' : 'px-3 py-2 text-sm gap-2';

  return (
    <div
      ref={node => {
        drag(node);
        drop(node);
      }}
      data-tag={tag.name}
      className={`rounded border-2 ${crew ? 'flex flex-col items-stretch' : 'inline-flex items-center'} ${
        canEdit ? 'cursor-grab active:cursor-grabbing' : ''
      } ${size} ${colours[tag.type]} ${isDragging ? 'opacity-40' : ''}`}
    >
      <div className="flex items-center gap-1">
        <span className="font-medium whitespace-nowrap">{tag.name}</span>
        {onRemove && canEdit && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${tag.name} from roster`}
            className="ml-auto rounded hover:bg-black/10 p-0.5"
          >
            <X className="w-3 h-3" aria-hidden />
          </button>
        )}
      </div>
      {crew && (
        <div role="group" aria-label={`People on ${tag.name}`} className="mt-1 flex flex-col items-stretch gap-1">
          {crew.map(person => (
            <DraggableTag key={person.id} tag={person} compact onRemove={() => onCrewRemove?.(person.id)} />
          ))}
          {canEdit && (
            <div
              className={`rounded border border-dashed px-2 py-1 text-[10px] ${
                isOver && canDrop ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-green-500/60 text-green-800'
              }`}
            >
              Drop a person here
            </div>
          )}
        </div>
      )}
    </div>
  );
}
