import { useDrop } from 'react-dnd';
import { Category, Tag } from './RosterBoard';
import { DraggableTag } from './DraggableTag';

interface RosterGridProps {
  categories: Category[];
  locations: string[];
  onDrop: (tagId: string, fromCategoryId: string | null, toCategoryId: string | null, locationIndex?: number) => void;
}

export function RosterGrid({ categories, locations, onDrop }: RosterGridProps) {
  return (
    <div className="overflow-auto roster-grid">
      <div className="inline-block min-w-full">
        <table className="border-collapse w-full">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-gray-800 text-white px-3 py-2 text-left font-semibold text-sm border border-gray-700 min-w-[180px]">
                LOCATION
              </th>
              {categories.map(category => (
                <th
                  key={category.id}
                  className="bg-gray-800 text-white px-3 py-2 text-center font-semibold text-sm border border-gray-700 min-w-[150px]"
                >
                  {category.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {locations.map((location, locationIndex) => (
              <tr key={locationIndex}>
                <td className="sticky left-0 z-10 bg-gray-100 px-3 py-2 font-medium text-gray-700 border border-gray-300 text-sm">
                  {location}
                </td>
                {categories.map(category => (
                  <GridCell
                    key={`${category.id}-${locationIndex}`}
                    category={category}
                    locationIndex={locationIndex}
                    tags={category.tags.filter(t => t.locationIndex === locationIndex)}
                    onDrop={onDrop}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface GridCellProps {
  category: Category;
  locationIndex: number;
  tags: Tag[];
  onDrop: (tagId: string, fromCategoryId: string | null, toCategoryId: string | null, locationIndex?: number) => void;
}

function GridCell({ category, locationIndex, tags, onDrop }: GridCellProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TAG',
    drop: (item: { id: string; categoryId: string | null }) => {
      onDrop(item.id, item.categoryId, category.id, locationIndex);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <td
      ref={drop}
      className={`border border-gray-300 p-2 min-h-[60px] transition-colors ${
        isOver ? 'bg-blue-50 border-blue-400' : 'bg-white'
      }`}
    >
      <div className="flex flex-wrap gap-1.5 min-h-[44px]">
        {tags.map(tag => (
          <DraggableTag
            key={tag.id}
            tag={tag}
            categoryId={category.id}
            compact
          />
        ))}
      </div>
    </td>
  );
}