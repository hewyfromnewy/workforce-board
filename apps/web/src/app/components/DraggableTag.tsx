import { useDrag } from 'react-dnd';
import { User, Package, X } from 'lucide-react';
import type { Tag } from '@workforce/shared';
import { useAccess } from '@/app/access';

interface DraggableTagProps {
  tag: Tag;
  compact?: boolean;
  onRemove?: () => void;
}

export function DraggableTag({ tag, compact, onRemove }: DraggableTagProps) {
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

  const colour =
    tag.type === 'member'
      ? 'bg-amber-100 border-amber-300 text-amber-900'
      : 'bg-green-100 border-green-300 text-green-900';
  const Icon = tag.type === 'member' ? User : Package;
  const size = compact ? 'px-2 py-1 text-xs gap-1' : 'px-3 py-2 text-sm gap-2';

  return (
    <div
      ref={drag}
      data-tag={tag.name}
      className={`inline-flex items-center rounded border-2 ${canEdit ? 'cursor-grab active:cursor-grabbing' : ''} ${size} ${colour} ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      <Icon className={compact ? 'w-3 h-3' : 'w-4 h-4'} aria-hidden />
      <span className="font-medium">{tag.name}</span>
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
