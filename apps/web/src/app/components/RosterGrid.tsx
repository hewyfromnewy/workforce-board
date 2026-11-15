import { useDrop } from 'react-dnd';
import type { Assignment, Category, Tag } from '@workforce/shared';
import { DraggableTag } from './DraggableTag';

interface RosterGridProps {
  categories: Category[];
  locations: string[];
  assignments: Assignment[];
  tagById: Map<string, Tag>;
  onAssign: (tagId: string, categoryId: string, location: string) => void;
  onUnassign: (tagId: string) => void;
}

export function RosterGrid({ categories, locations, assignments, tagById, onAssign, onUnassign }: RosterGridProps) {
  return (
    <table className="border-collapse w-full">
      <thead>
        <tr>
          <th scope="col" className="sticky left-0 z-10 bg-gray-800 text-white px-3 py-2 text-left font-semibold text-sm border border-gray-700 min-w-[110px]">
            LOCATION
          </th>
          {categories.map(category => (
            <th key={category.id} scope="col" className="bg-gray-800 text-white px-2 py-2 text-center font-semibold text-xs border border-gray-700 min-w-[100px]">
              {category.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {locations.map(location => (
          <tr key={location}>
            <th scope="row" className="sticky left-0 z-10 bg-gray-100 px-3 py-2 text-left font-medium text-gray-700 border border-gray-300 text-sm">
              {location}
            </th>
            {categories.map(category => (
              <GridCell
                key={category.id}
                label={`${location} ${category.name}`}
                tags={assignments
                  .filter(a => a.location === location && a.categoryId === category.id)
                  .map(a => tagById.get(a.tagId)!)}
                onDrop={tagId => onAssign(tagId, category.id, location)}
                onUnassign={onUnassign}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface GridCellProps {
  label: string;
  tags: Tag[];
  onDrop: (tagId: string) => void;
  onUnassign: (tagId: string) => void;
}

function GridCell({ label, tags, onDrop, onUnassign }: GridCellProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TAG',
    drop: (item: { id: string }) => onDrop(item.id),
    collect: monitor => ({ isOver: monitor.isOver() }),
  }));

  return (
    <td
      ref={drop}
      aria-label={label}
      className={`border border-gray-300 p-2 align-top ${isOver ? 'bg-blue-50 border-blue-400' : 'bg-white'}`}
    >
      <div className="flex flex-wrap gap-1.5 min-h-[44px]">
        {tags.map(tag => (
          <DraggableTag key={tag.id} tag={tag} compact onRemove={() => onUnassign(tag.id)} />
        ))}
      </div>
    </td>
  );
}
