import { useState } from 'react';
import { MapPin, Package, Plus, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';
import type { TagType } from '@workforce/shared';
import type { StoreApi } from '@/app/store';

interface SectionProps {
  title: string;
  noun: string;
  icon: React.ReactNode;
  items: { key: string; name: string }[];
  onAdd: (name: string) => 'added' | 'duplicate';
  onRemove: (key: string) => (() => void);
}

function Section({ title, noun, icon, items, onAdd, onRemove }: SectionProps) {
  const [name, setName] = useState('');
  const id = `add-${noun.replace(/\s/g, '-')}`;

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (onAdd(name) === 'duplicate') {
      toast.error(`${name.trim()} is already in the list`);
      return;
    }
    toast.success(`Added ${name.trim()}`);
    setName('');
  };

  const remove = (item: { key: string; name: string }) => {
    const undo = onRemove(item.key);
    toast(`Removed ${item.name}`, { action: { label: 'Undo', onClick: undo } });
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
        <input
          id={id}
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={`New ${noun} name`}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
        />
        <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
          <Plus className="w-4 h-4" aria-hidden />
          Add {noun}
        </button>
      </form>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">No {noun}s yet. Add the first one above.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {items.map(item => (
            <li key={item.key} className="flex items-center justify-between py-2">
              <span>{item.name}</span>
              <button
                type="button"
                onClick={() => remove(item)}
                aria-label={`Remove ${item.name}`}
                className="p-2 text-gray-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function ManagePage({ api }: { api: StoreApi }) {
  const { store } = api;
  const byType = (type: TagType) =>
    store.tags.filter(t => t.type === type).map(t => ({ key: t.id, name: t.name }));

  return (
    <div className="h-full overflow-auto">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">Manage</h1>
        <p className="text-sm text-gray-500">The people, assets and locations you can put on a roster.</p>
      </header>
      <div className="p-4 grid gap-4 xl:grid-cols-3 items-start">
        <Section
          title="Team members"
          noun="team member"
          icon={<User className="w-4 h-4" aria-hidden />}
          items={byType('member')}
          onAdd={name => api.addTag(name, 'member')}
          onRemove={api.removeTag}
        />
        <Section
          title="Assets"
          noun="asset"
          icon={<Package className="w-4 h-4" aria-hidden />}
          items={byType('asset')}
          onAdd={name => api.addTag(name, 'asset')}
          onRemove={api.removeTag}
        />
        <Section
          title="Locations"
          noun="location"
          icon={<MapPin className="w-4 h-4" aria-hidden />}
          items={store.locations.map(l => ({ key: l, name: l }))}
          onAdd={api.addLocation}
          onRemove={api.removeLocation}
        />
      </div>
    </div>
  );
}
