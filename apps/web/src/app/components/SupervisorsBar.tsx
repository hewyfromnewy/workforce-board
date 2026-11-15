import { useDrop } from 'react-dnd';
import type { Tag } from '@workforce/shared';
import { DraggableTag } from './DraggableTag';

interface SupervisorsBarProps {
  tags: Tag[];
  onSet: (tagId: string) => void;
  onUnassign: (tagId: string) => void;
}

export function SupervisorsBar({ tags, onSet, onUnassign }: SupervisorsBarProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TAG',
    drop: (item: { id: string }) => onSet(item.id),
    collect: monitor => ({ isOver: monitor.isOver() }),
  }));

  return (
    <div
      ref={drop}
      aria-label="Supervisors"
      data-tour="supervisors"
      role="group"
      className={`flex flex-wrap items-center gap-2 px-4 py-2 border-b border-gray-200 ${isOver ? 'bg-blue-50' : 'bg-white'}`}
    >
      <span className="text-xs font-semibold text-gray-500 uppercase">Supervisors</span>
      {tags.length === 0 && <span className="text-sm text-gray-400">Drag a person here</span>}
      {tags.map(tag => (
        <DraggableTag key={tag.id} tag={tag} compact onRemove={() => onUnassign(tag.id)} />
      ))}
    </div>
  );
}
