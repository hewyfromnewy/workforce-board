import { useDrag } from 'react-dnd';
import { X } from 'lucide-react';
import type { Tag } from '@workforce/shared';
import { useAccess } from '@/app/access';

interface DraggableTagProps {
  tag: Tag;
  compact?: boolean;
  operator?: string;
  onRemove?: () => void;
}

const colours: Record<Tag['type'], string> = {
  member: 'bg-amber-100 border-amber-300 text-amber-900',
  asset: 'bg-green-100 border-green-300 text-green-900',
  hire: 'bg-white border-gray-400 text-gray-900',
};

export function DraggableTag({ tag, compact, operator, onRemove }: DraggableTagProps) {
  const { can } = useAccess();
  const canEdit = can('roster.edit');
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'TAG',
      item: { id: tag.id },
      canDrag: canEdit,
      collect: monitor => ({ isDragging: monitor.isDragging() }),
    }),
    [tag.id, canEdit],
  );

  const size = compact ? 'px-2 py-1 text-xs gap-1' : 'px-3 py-2 text-sm gap-2';

  return (
    <div
      ref={drag}
      data-tag={tag.name}
      className={`inline-flex items-center rounded border-2 ${canEdit ? 'cursor-grab active:cursor-grabbing' : ''} ${size} ${colours[tag.type]} ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      <span className="font-medium">{tag.name}</span>
      {operator && <span className="font-normal opacity-80">· {operator}</span>}
      {onRemove && canEdit && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${tag.name} from roster`}
          className="ml-1 rounded hover:bg-black/10 p-0.5"
        >
          <X className="w-3 h-3" aria-hidden />
        </button>
      )}
    </div>
  );
}
