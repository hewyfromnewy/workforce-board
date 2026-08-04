import { useEffect, useState } from 'react';
import { DEFAULT_CREW, type JobSite, type Resource, type ResourceType } from '@workforce/shared';
import { useRepo } from '@/data/RepoContext';

const TYPES: ResourceType[] = ['person', 'plant', 'hire', 'contractor'];
const TYPE_ORDER: Record<ResourceType, number> = { person: 0, plant: 1, hire: 2, contractor: 3 };
const input = 'rounded border border-slate-300 px-2 py-1 text-sm';

/** Master-data CRUD (§4.7). Soft-delete only — resources go inactive, job sites
 *  go complete; nothing is hard-deleted (§3/§6 history). */
export function ManagePanel({ onClose }: { onClose: () => void }) {
  const repo = useRepo();
  const [tab, setTab] = useState<'resources' | 'sites'>('resources');
  const [resources, setResources] = useState<Resource[]>([]);
  const [sites, setSites] = useState<JobSite[]>([]);

  async function reload() {
    setResources((await repo.listAllResources()).sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type] || a.name.localeCompare(b.name)));
    setSites(await repo.listAllJobSites());
  }
  useEffect(() => { void reload(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saveR = async (id: string, patch: Partial<Omit<Resource, 'id'>>) => { await repo.updateResource(id, patch); await reload(); };
  const saveS = async (id: string, patch: Partial<Omit<JobSite, 'id'>>) => { await repo.updateJobSite(id, patch); await reload(); };

  // Add forms
  const [rName, setRName] = useState('');
  const [rType, setRType] = useState<ResourceType>('person');
  const [rRate, setRRate] = useState('');
  async function addResource() {
    if (!rName.trim()) return;
    await repo.addResource({ name: rName.trim(), type: rType, crew: DEFAULT_CREW, rate: rRate ? Number(rRate) : null, active: true });
    setRName(''); setRRate(''); await reload();
  }
  const [sName, setSName] = useState('');
  const [sNum, setSNum] = useState('');
  async function addSite() {
    if (!sName.trim() || !sNum.trim()) return;
    await repo.addJobSite({ name: sName.trim(), jobNumber: sNum.trim(), crew: DEFAULT_CREW, startDate: null, endDate: null, status: 'active' });
    setSName(''); setSNum(''); await reload();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div className="flex items-center gap-2">
            {(['resources', 'sites'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${tab === t ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                {t === 'resources' ? 'Resources' : 'Job sites'}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="rounded px-2 text-xl leading-none text-slate-400 hover:text-slate-700">×</button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          {tab === 'resources' ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                <input value={rName} onChange={(e) => setRName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addResource()} placeholder="Name (e.g. 188 Ute)" className={`${input} flex-1`} />
                <select value={rType} onChange={(e) => setRType(e.target.value as ResourceType)} className={input}>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <input value={rRate} onChange={(e) => setRRate(e.target.value)} type="number" placeholder="rate" className={`${input} w-20`} />
                <button onClick={addResource} className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700">Add</button>
              </div>
              <div className="divide-y divide-slate-100">
                {resources.map((r) => (
                  <div key={r.id} className={`grid grid-cols-[1fr_110px_80px_90px] items-center gap-2 py-1.5 ${r.active ? '' : 'opacity-50'}`}>
                    <input defaultValue={r.name} onBlur={(e) => e.target.value.trim() && e.target.value.trim() !== r.name && saveR(r.id, { name: e.target.value.trim() })} className={input} />
                    <select defaultValue={r.type} onChange={(e) => saveR(r.id, { type: e.target.value as ResourceType })} className={input}>
                      {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input defaultValue={r.rate ?? ''} type="number" placeholder="—" onBlur={(e) => saveR(r.id, { rate: e.target.value ? Number(e.target.value) : null })} className={input} />
                    <button onClick={() => saveR(r.id, { active: !r.active })} className={`rounded px-2 py-1 text-xs font-semibold ${r.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                      {r.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                <input value={sName} onChange={(e) => setSName(e.target.value)} placeholder="Job site name" className={`${input} flex-1`} />
                <input value={sNum} onChange={(e) => setSNum(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSite()} placeholder="Job no." className={`${input} w-28`} />
                <button onClick={addSite} className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700">Add</button>
              </div>
              <div className="divide-y divide-slate-100">
                {sites.map((s) => (
                  <div key={s.id} className={`grid grid-cols-[1fr_100px_130px_130px_100px] items-center gap-2 py-1.5 ${s.status === 'complete' ? 'opacity-50' : ''}`}>
                    <input defaultValue={s.name} onBlur={(e) => e.target.value.trim() && e.target.value.trim() !== s.name && saveS(s.id, { name: e.target.value.trim() })} className={input} />
                    <input defaultValue={s.jobNumber} onBlur={(e) => e.target.value.trim() && e.target.value.trim() !== s.jobNumber && saveS(s.id, { jobNumber: e.target.value.trim() })} className={input} />
                    <input type="date" defaultValue={s.startDate ?? ''} onBlur={(e) => saveS(s.id, { startDate: e.target.value || null })} className={input} />
                    <input type="date" defaultValue={s.endDate ?? ''} onBlur={(e) => saveS(s.id, { endDate: e.target.value || null })} className={input} />
                    <button onClick={() => saveS(s.id, { status: s.status === 'active' ? 'complete' : 'active' })} className={`rounded px-2 py-1 text-xs font-semibold ${s.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                      {s.status === 'active' ? 'Active' : 'Complete'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 p-3 text-right">
          <button onClick={onClose} className="rounded-lg bg-slate-800 px-4 py-1.5 text-sm font-semibold text-white hover:bg-slate-700">Done</button>
        </div>
      </div>
    </div>
  );
}
