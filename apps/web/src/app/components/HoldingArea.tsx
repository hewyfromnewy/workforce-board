import { useDrop } from 'react-dnd';
import { Plus, Package as PackageIcon } from 'lucide-react';
import { Tag } from './RosterBoard';
import { DraggableTag } from './DraggableTag';

interface HoldingAreaProps {
  tags: Tag[];
  onDrop: (tagId: string, fromCategoryId: string | null, toCategoryId: string | null) => void;
  onAddTag: (tag: Tag) => void;
  onDeleteTag: (tagId: string) => void;
}

export function HoldingArea({ tags, onDrop, onAddTag, onDeleteTag }: HoldingAreaProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TAG',
    drop: (item: { id: string; categoryId: string | null }) => {
      onDrop(item.id, item.categoryId, null);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const members = tags.filter(t => t.type === 'member');
  const assets = tags.filter(t => t.type === 'asset');

  return (
    <div className="w-full lg:w-80 xl:w-96 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PackageIcon className="w-5 h-5" />
          <h2 className="font-semibold">Available Tags</h2>
        </div>
        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
          {tags.length}
        </span>
      </div>

      <div
        ref={drop}
        className={`flex-1 overflow-auto p-4 transition-colors ${
          isOver ? 'bg-blue-50' : 'bg-gray-50'
        }`}
      >
        {tags.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
            <PackageIcon className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-center">No tags available</p>
            <p className="text-center text-xs mt-1">Drag tags here or add new ones</p>
          </div>
        ) : (
          <div className="space-y-4">
            {members.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Team Members ({members.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {members.map(tag => (
                    <DraggableTag
                      key={tag.id}
                      tag={tag}
                      categoryId={null}
                      onDelete={onDeleteTag}
                    />
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
                    <DraggableTag
                      key={tag.id}
                      tag={tag}
                      categoryId={null}
                      onDelete={onDeleteTag}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
