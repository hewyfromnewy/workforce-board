import { useState } from 'react';
import { useDrop } from 'react-dnd';
import { Users } from 'lucide-react';
import type { Tag, TagType } from '@workforce/shared';
import { DraggableTag } from './DraggableTag';

interface HoldingAreaProps {
  tags: Tag[];
  onUnassign: (tagId: string) => void;
}

const groups: { type: TagType; title: string }[] = [
  { type: 'member', title: 'Team members' },
  { type: 'asset', title: 'Assets' },
  { type: 'hire', title: 'Hire and contractors' },
];

export function HoldingArea({ tags, onUnassign }: HoldingAreaProps) {
  const [query, setQuery] = useState('');
  const needle = query.trim().toLowerCase();
  const shown = needle === '' ? tags : tags.filter(t => t.name.toLowerCase().includes(needle));
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TAG',
    drop: (item: { id: string }) => onUnassign(item.id),
    collect: monitor => ({ isOver: monitor.isOver() }),
  }));

  return (
    <section
      aria-label="Not on the roster"
      data-tour="waiting"
      className="shrink-0 w-full lg:w-64 bg-white rounded-lg shadow border border-gray-200 flex flex-col overflow-hidden"
    >
      <div className="bg-blue-700 text-white px-4 py-3 flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" aria-hidden />
          Not on the roster
        </h2>
        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{tags.length}</span>
      </div>
      <div className="px-4 py-2 border-b border-gray-200 bg-white">
        <label htmlFor="waiting-search" className="sr-only">Search not on the roster</label>
        <input
          id="waiting-search"
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name"
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white"
        />
      </div>
      <div ref={drop} className={`flex-1 overflow-auto p-4 ${isOver ? 'bg-blue-50' : 'bg-gray-50'}`}>
        {tags.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">
            Everyone is on the roster for this day. Drag a tag here to take it off.
          </p>
        ) : shown.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">Nobody matches "{query.trim()}".</p>
        ) : (
          <div className="space-y-4">
            {groups.map(group => {
              const items = shown.filter(t => t.type === group.type);
              if (items.length === 0) return null;
              return (
                <div key={group.type}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    {group.title} ({items.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {items.map(tag => (
                      <DraggableTag key={tag.id} tag={tag} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
