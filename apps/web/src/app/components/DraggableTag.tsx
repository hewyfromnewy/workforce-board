import { useDrag } from 'react-dnd';
import { User, Package } from 'lucide-react';
import { Tag } from './RosterBoard';

interface DraggableTagProps {
  tag: Tag;
  categoryId: string | null;
  compact?: boolean;
  onDelete?: (tagId: string) => void;
}

export function DraggableTag({ tag, categoryId, compact, onDelete }: DraggableTagProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TAG',
    item: { id: tag.id, categoryId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [tag.id, categoryId]); // Add dependencies to recreate when they change

  const bgColor = tag.type === 'member' 
    ? 'bg-amber-100 border-amber-300 text-amber-900' 
    : 'bg-green-100 border-green-300 text-green-900';

  const Icon = tag.type === 'member' ? User : Package;

  if (compact) {
    return (
      <div
        ref={drag}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded border-2 cursor-move transition-opacity text-xs ${bgColor} ${
          isDragging ? 'opacity-50' : 'opacity-100'
        }`}
      >
        <Icon className="w-3 h-3" />
        <span className="font-medium">{tag.name}</span>
      </div>
    );
  }

  return (
    <div
      ref={drag}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-move transition-all shadow-sm hover:shadow-md ${bgColor} ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium text-sm">{tag.name}</span>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(tag.id);
          }}
          className="ml-auto text-gray-400 hover:text-red-600 transition-colors"
        >
          ×
        </button>
      )}
    </div>
  );
}