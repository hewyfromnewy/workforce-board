import { useDrop } from 'react-dnd';
import { Users } from 'lucide-react';
import type { Tag } from '@workforce/shared';
import { DraggableTag } from './DraggableTag';

interface HoldingAreaProps {
  tags: Tag[];
  onUnassign: (tagId: string) => void;
}

export function HoldingArea({ tags, onUnassign }: HoldingAreaProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TAG',
    drop: (item: { id: string }) => onUnassign(item.id),
    collect: monitor => ({ isOver: monitor.isOver() }),
  }));

  const members = tags.filter(t => t.type === 'member');
  const assets = tags.filter(t => t.type === 'asset');

  return (
    <section
      aria-label="Not on the roster"
      className="shrink-0 w-full lg:w-64 bg-white rounded-lg shadow border border-gray-200 flex flex-col overflow-hidden"
    >
      <div className="bg-blue-700 text-white px-4 py-3 flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" aria-hidden />
          Not on the roster
        </h2>
        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{tags.length}</span>
      </div>
      <div ref={drop} className={`flex-1 overflow-auto p-4 ${isOver ? 'bg-blue-50' : 'bg-gray-50'}`}>
        {tags.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">
            Everyone is on the roster for this day. Drag a tag here to take it off.
          </p>
        ) : (
          <div className="space-y-4">
            {members.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Team members ({members.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {members.map(tag => (
                    <DraggableTag key={tag.id} tag={tag} />
                  ))}
                </div>
              </div>
            )}
            {assets.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Assets ({assets.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {assets.map(tag => (
                    <DraggableTag key={tag.id} tag={tag} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
