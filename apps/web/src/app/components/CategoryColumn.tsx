import { useDrop } from 'react-dnd';
import { Category, Tag } from './RosterBoard';
import { DraggableTag } from './DraggableTag';

interface CategoryColumnProps {
  category: Category;
  locations?: string[];
  onDrop: (tagId: string, fromCategoryId: string | null, toCategoryId: string | null, locationIndex?: number) => void;
}

export function CategoryColumn({ category, locations = [], onDrop }: CategoryColumnProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="bg-gray-800 text-white px-3 py-2 rounded-t-lg font-semibold text-sm">
        {category.name}
      </div>
      {locations.map((location, index) => (
        <LocationRow
          key={index}
          location={location}
          locationIndex={index}
          tags={category.tags.filter(t => t.locationIndex === index)}
          categoryId={category.id}
          onDrop={onDrop}
        />
      ))}
    </div>
  );
}

interface LocationRowProps {
  location: string;
  locationIndex: number;
  tags: Tag[];
  categoryId: string;
  onDrop: (tagId: string, fromCategoryId: string | null, toCategoryId: string | null, locationIndex?: number) => void;
}

function LocationRow({ location, locationIndex, tags, categoryId, onDrop }: LocationRowProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TAG',
    drop: (item: { id: string; categoryId: string | null }) => {
      onDrop(item.id, item.categoryId, categoryId, locationIndex);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`flex items-center gap-2 min-h-[50px] bg-white border-2 rounded-lg p-2 transition-colors ${
        isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}
    >
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap mr-2 min-w-[120px]">{location}:</span>
      <div className="flex flex-wrap gap-1.5 flex-1">
        {tags.map(tag => (
          <DraggableTag
            key={tag.id}
            tag={tag}
            categoryId={categoryId}
            compact
          />
        ))}
      </div>
    </div>
  );
}
