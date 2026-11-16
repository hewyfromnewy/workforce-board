import { useState } from 'react';
import { useDrop } from 'react-dnd';
import { noteKey } from '@workforce/shared';
import type { Assignment, Category, Job, Tag } from '@workforce/shared';
import { useAccess } from '@/app/access';
import { DraggableTag } from './DraggableTag';

interface RosterGridProps {
  categories: Category[];
  jobs: Job[];
  assignments: Assignment[];
  notes: Record<string, string>;
  tagById: Map<string, Tag>;
  onAssign: (tagId: string, categoryId: string, jobId: string) => void;
  onUnassign: (tagId: string) => void;
  onCrew: (tagId: string, assetId: string) => void;
  onNote: (jobId: string, categoryId: string, text: string) => void;
}

export function RosterGrid({ categories, jobs, assignments, notes, tagById, onAssign, onUnassign, onCrew, onNote }: RosterGridProps) {
  return (
    <table className="border-separate border-spacing-0 w-full">
      <thead>
        <tr>
          <th scope="col" className="sticky top-0 left-0 z-30 bg-gray-800 text-white px-3 py-2 text-left font-semibold text-sm border border-gray-700 min-w-[110px]">
            LOCATION
          </th>
          {categories.map(category => (
            <th key={category.id} scope="col" className="sticky top-0 z-20 bg-gray-800 text-white px-2 py-2 text-center font-semibold text-xs border border-gray-700 min-w-[100px]">
              {category.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {jobs.map(job => (
          <tr key={job.id}>
            <th scope="row" className="sticky left-0 z-10 bg-gray-100 px-3 py-2 text-left align-top border border-gray-300 text-sm">
              <div className="font-medium text-gray-700">{job.name}</div>
              {job.jobNumber && <div className="text-xs font-semibold text-red-600">{job.jobNumber}</div>}
              {job.note && <div className="text-xs font-normal text-gray-500">{job.note}</div>}
            </th>
            {categories.map(category => (
              <GridCell
                key={category.id}
                label={`${job.name}${job.jobNumber ? ` ${job.jobNumber}` : ''} ${category.name}`}
                note={notes[noteKey(job.id, category.id)] ?? ''}
                crewOf={tagId => assignments.filter(a => a.onTagId === tagId).map(a => tagById.get(a.tagId)!)}
                onPlant={
                  category.id === 'personnel'
                    ? assignments
                        .filter(a => a.jobId === job.id && a.onTagId)
                        .map(a => ({ person: tagById.get(a.tagId)!, plant: tagById.get(a.onTagId!)! }))
                    : []
                }
                tags={assignments
                  .filter(a => a.jobId === job.id && a.categoryId === category.id && !a.onTagId)
                  .map(a => tagById.get(a.tagId)!)}
                onDrop={tagId => onAssign(tagId, category.id, job.id)}
                onUnassign={onUnassign}
                onCrew={onCrew}
                onNote={text => onNote(job.id, category.id, text)}
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
  note: string;
  tags: Tag[];
  onPlant: { person: Tag; plant: Tag }[];
  crewOf: (tagId: string) => Tag[];
  onDrop: (tagId: string) => void;
  onUnassign: (tagId: string) => void;
  onCrew: (tagId: string, assetId: string) => void;
  onNote: (text: string) => void;
}

function GridCell({ label, note, tags, onPlant, crewOf, onDrop, onUnassign, onCrew, onNote }: GridCellProps) {
  const [editing, setEditing] = useState(false);
  const { can } = useAccess();
  const canEdit = can('roster.edit');
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TAG',
    drop: (item: { id: string }, monitor) => {
      if (!monitor.didDrop()) onDrop(item.id);
    },
    collect: monitor => ({ isOver: monitor.isOver() }),
  }));

  return (
    <td
      ref={drop}
      aria-label={label}
      className={`border border-gray-300 p-2 align-top ${isOver ? 'bg-blue-50 border-blue-400' : 'bg-white'}`}
    >
      <div className="flex flex-col items-start gap-1.5 min-h-[44px]">
        {tags.map(tag => (
          <DraggableTag
            key={tag.id}
            tag={tag}
            compact
            crew={tag.type === 'member' ? undefined : crewOf(tag.id)}
            onCrewDrop={personId => onCrew(personId, tag.id)}
            onCrewRemove={onUnassign}
            onRemove={() => onUnassign(tag.id)}
          />
        ))}
        {onPlant.map(({ person, plant }) => (
          <DraggableTag key={person.id} tag={person} compact via={plant.name} />
        ))}
      </div>
      {editing ? (
        <input
          autoFocus
          aria-label={`Note for ${label}`}
          defaultValue={note}
          onBlur={e => {
            onNote(e.target.value.trim());
            setEditing(false);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') e.currentTarget.blur();
            if (e.key === 'Escape') setEditing(false);
          }}
          className="mt-1 w-full px-1 py-0.5 text-xs border border-gray-300 rounded"
        />
      ) : note ? (
        <button
          type="button"
          disabled={!canEdit}
          aria-label={`Edit note for ${label}`}
          onClick={() => setEditing(true)}
          className="mt-1 text-left text-xs italic text-gray-700"
        >
          {note}
        </button>
      ) : (
        canEdit && (
          <button
            type="button"
            aria-label={`Add note to ${label}`}
            onClick={() => setEditing(true)}
            className="mt-1 text-[10px] text-gray-400 hover:text-gray-700"
          >
            + note
          </button>
        )
      )}
    </td>
  );
}
