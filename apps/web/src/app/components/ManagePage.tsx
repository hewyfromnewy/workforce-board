import { useState } from 'react';
import { MapPin, Package, Pencil, Plus, Trash2, Truck, User } from 'lucide-react';
import { toast } from 'sonner';
import type { Job, TagType } from '@workforce/shared';
import type { BulkResult, StoreApi } from '@/app/store';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';

const input = 'px-3 py-2 border border-gray-300 rounded-lg';
const primary = 'flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg';

const summary = (result: BulkResult) =>
  result.skipped === 0
    ? `Added ${result.added}`
    : `Added ${result.added}, skipped ${result.skipped} already in the list`;

function PasteList({ id, noun, hint, onAdd }: { id: string; noun: string; hint: string; onAdd: (lines: string[]) => BulkResult }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-sm text-blue-700 hover:underline">
        Paste a list of {noun}s
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor={`${id}-paste`} className="text-sm font-medium">
        {hint}
      </label>
      <textarea
        id={`${id}-paste`}
        value={text}
        onChange={e => setText(e.target.value)}
        rows={5}
        className={`${input} w-full`}
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            toast.success(summary(onAdd(text.split('\n'))));
            setText('');
            setOpen(false);
          }}
          className={primary}
        >
          Add all
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
          Cancel
        </button>
      </div>
    </div>
  );
}

interface TagSectionProps {
  api: StoreApi;
  type: TagType;
  title: string;
  noun: string;
  icon: React.ReactNode;
}

function TagSection({ api, type, title, noun, icon }: TagSectionProps) {
  const [name, setName] = useState('');
  const id = `add-${noun.replace(/\s/g, '-')}`;
  const items = api.store.tags.filter(t => t.type === type);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (api.addTag(name, type) === 'duplicate') {
      toast.error(`${name.trim()} is already in the list`);
      return;
    }
    toast.success(`Added ${name.trim()}`);
    setName('');
  };

  const remove = (tag: { id: string; name: string }) => {
    const undo = api.removeTag(tag.id);
    toast(`Removed ${tag.name}`, { action: { label: 'Undo', onClick: undo } });
  };

  return (
    <section aria-labelledby={`${id}-title`} className="bg-white rounded-lg shadow border border-gray-200 p-4 space-y-4">
      <h2 id={`${id}-title`} className="font-semibold text-gray-900 flex items-center gap-2">
        {icon}
        {title} ({items.length})
      </h2>
      <form onSubmit={add} className="flex gap-2">
        <label htmlFor={id} className="sr-only">
          New {noun} name
        </label>
        <input id={id} value={name} onChange={e => setName(e.target.value)} placeholder={`New ${noun} name`} className={`${input} flex-1 min-w-0`} />
        <button type="submit" className={primary}>
          <Plus className="w-4 h-4" aria-hidden />
          Add {noun}
        </button>
      </form>
      <PasteList id={id} noun={noun} hint={`${noun[0].toUpperCase()}${noun.slice(1)} names, one per line`} onAdd={lines => api.addTags(lines, type)} />
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">No {noun}s yet. Add the first one above.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {items.map(tag => (
            <li key={tag.id} className="flex items-center justify-between py-2">
              <span>{tag.name}</span>
              <button type="button" onClick={() => remove(tag)} aria-label={`Remove ${tag.name}`} className="p-2 text-gray-500 hover:text-red-600">
                <Trash2 className="w-4 h-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function EditJobDialog({ job, onSave, onClose }: { job: Job | null; onSave: (change: Omit<Job, 'id'>) => void; onClose: () => void }) {
  const [name, setName] = useState(job?.name ?? '');
  const [jobNumber, setJobNumber] = useState(job?.jobNumber ?? '');
  const [note, setNote] = useState(job?.note ?? '');

  return (
    <Dialog open={job !== null} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit location</DialogTitle>
          <DialogDescription>Change the name, job number or note shown on the board.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSave({ name: name.trim(), jobNumber: jobNumber.trim(), note: note.trim() });
          }}
          className="space-y-3"
        >
          <div className="space-y-1">
            <label htmlFor="edit-name" className="text-sm font-medium">Name</label>
            <input id="edit-name" value={name} onChange={e => setName(e.target.value)} className={`${input} w-full`} />
          </div>
          <div className="space-y-1">
            <label htmlFor="edit-number" className="text-sm font-medium">Job number</label>
            <input id="edit-number" value={jobNumber} onChange={e => setJobNumber(e.target.value)} className={`${input} w-full`} />
          </div>
          <div className="space-y-1">
            <label htmlFor="edit-note" className="text-sm font-medium">Note</label>
            <input id="edit-note" value={note} onChange={e => setNote(e.target.value)} className={`${input} w-full`} />
          </div>
          <button type="submit" disabled={!name.trim()} className={`${primary} disabled:opacity-50`}>
            Save location
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function JobsSection({ api }: { api: StoreApi }) {
  const [name, setName] = useState('');
  const [jobNumber, setJobNumber] = useState('');
  const [editing, setEditing] = useState<Job | null>(null);
  const { jobs } = api.store;

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (api.addJob(name, jobNumber) === 'duplicate') {
      toast.error(`${name.trim()} ${jobNumber.trim()} is already in the list`.replace('  ', ' '));
      return;
    }
    toast.success(`Added ${name.trim()}`);
    setName('');
    setJobNumber('');
  };

  const remove = (job: Job) => {
    const undo = api.removeJob(job.id);
    toast(`Removed ${job.name}`, { action: { label: 'Undo', onClick: undo } });
  };

  return (
    <section aria-labelledby="locations-title" className="bg-white rounded-lg shadow border border-gray-200 p-4 space-y-4">
      <h2 id="locations-title" className="font-semibold text-gray-900 flex items-center gap-2">
        <MapPin className="w-4 h-4" aria-hidden />
        Locations ({jobs.length})
      </h2>
      <form onSubmit={add} className="flex flex-wrap gap-2">
        <label htmlFor="add-location" className="sr-only">New location name</label>
        <input id="add-location" value={name} onChange={e => setName(e.target.value)} placeholder="New location name" className={`${input} flex-1 min-w-32`} />
        <label htmlFor="add-job-number" className="sr-only">Job number (optional)</label>
        <input id="add-job-number" value={jobNumber} onChange={e => setJobNumber(e.target.value)} placeholder="Job number" className={`${input} w-28`} />
        <button type="submit" className={primary}>
          <Plus className="w-4 h-4" aria-hidden />
          Add location
        </button>
      </form>
      <PasteList id="add-location" noun="location" hint="Locations, one per line. Add a job number after a comma, like Irrawang, 14525." onAdd={api.addJobs} />
      {jobs.length === 0 ? (
        <p className="text-sm text-gray-500">No locations yet. Add the first one above.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {jobs.map(job => (
            <li key={job.id} className="flex items-center gap-2 py-2">
              <span className="mr-auto">
                {job.name}
                {job.jobNumber && <span className="ml-2 text-sm font-semibold text-red-600">{job.jobNumber}</span>}
                {job.note && <span className="ml-2 text-sm text-gray-500">{job.note}</span>}
              </span>
              <button type="button" onClick={() => setEditing(job)} aria-label={`Edit ${job.name}`} className="p-2 text-gray-500 hover:text-blue-700">
                <Pencil className="w-4 h-4" aria-hidden />
              </button>
              <button type="button" onClick={() => remove(job)} aria-label={`Remove ${job.name}`} className="p-2 text-gray-500 hover:text-red-600">
                <Trash2 className="w-4 h-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      {editing && (
        <EditJobDialog
          key={editing.id}
          job={editing}
          onSave={change => {
            api.updateJob(editing.id, change);
            toast.success(`Saved ${change.name}`);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}

export function ManagePage({ api }: { api: StoreApi }) {
  return (
    <div className="h-full overflow-auto">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">Manage</h1>
        <p className="text-sm text-gray-500">The people, plant and locations you can put on a roster.</p>
      </header>
      <div className="p-4 grid gap-4 xl:grid-cols-2 items-start">
        <TagSection api={api} type="member" title="Team members" noun="team member" icon={<User className="w-4 h-4" aria-hidden />} />
        <TagSection api={api} type="asset" title="Assets" noun="asset" icon={<Package className="w-4 h-4" aria-hidden />} />
        <TagSection api={api} type="hire" title="Hire and contractors" noun="hire item" icon={<Truck className="w-4 h-4" aria-hidden />} />
        <JobsSection api={api} />
      </div>
    </div>
  );
}
