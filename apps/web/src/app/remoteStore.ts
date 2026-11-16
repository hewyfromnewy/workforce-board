import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { Assignment, Job, RosterDay, SentRecord, Tag } from '@workforce/shared';
import { supabase } from './supabase';
import {
  assignTo,
  copiedFrom,
  dayOf,
  emptyDay,
  jobsAdded,
  noteOn,
  operatorOn,
  parseJobLine,
  sentOn,
  snapshotOf,
  supervisorOn,
  tagsAdded,
  unassignFrom,
  withoutJob,
  withoutTag,
} from './store';
import type { HistoryEntry, Store, StoreApi } from './store';

interface TagRow {
  id: string;
  name: string;
  type: Tag['type'];
  operator_id: string | null;
}

interface JobRow {
  id: string;
  name: string;
  job_number: string;
  note: string;
}

interface SendRow {
  date: string;
  sent_at: string;
  snapshot: Omit<SentRecord, 'at'>;
}

const emptyStore: Store = { orgName: '', tags: [], jobs: [], days: {} };

const toJob = (row: JobRow): Job => ({ id: row.id, name: row.name, jobNumber: row.job_number, note: row.note });

export function useRemoteStore(tenantId: string): StoreApi {
  const [store, setStore] = useState<Store>(emptyStore);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const storeRef = useRef(store);
  storeRef.current = store;
  const pending = useRef(0);

  const save = async (request: PromiseLike<{ error: unknown }>) => {
    pending.current += 1;
    const { error } = await request;
    pending.current -= 1;
    if (error) {
      toast.error('That change could not be saved. Reloading the latest roster.');
      await reloadAll();
    }
  };

  const fetchMaster = async () => {
    const [tags, jobs] = await Promise.all([
      supabase.from('tags').select('id, name, type, operator_id').eq('tenant_id', tenantId).eq('active', true).order('name'),
      supabase
        .from('jobs')
        .select('id, name, job_number, note')
        .eq('tenant_id', tenantId)
        .eq('active', true)
        .order('sort_order')
        .order('created_at'),
    ]);
    const activeIds = new Set((tags.data as TagRow[]).map(t => t.id));
    return {
      tags: (tags.data as TagRow[]).map(
        (t): Tag => ({
          id: t.id,
          name: t.name,
          type: t.type,
          ...(t.operator_id && activeIds.has(t.operator_id) && { operatorId: t.operator_id }),
        }),
      ),
      jobs: (jobs.data as JobRow[]).map(toJob),
    };
  };

  const fetchDay = async (date: string, master: { tags: Tag[]; jobs: Job[] }): Promise<RosterDay> => {
    const [days, assigns, notes, send] = await Promise.all([
      supabase.from('roster_days').select('supervisor_ids').eq('tenant_id', tenantId).eq('date', date).maybeSingle(),
      supabase.from('assignments').select('tag_id, category_id, job_id').eq('tenant_id', tenantId).eq('date', date),
      supabase.from('cell_notes').select('job_id, category_id, text').eq('tenant_id', tenantId).eq('date', date),
      supabase
        .from('roster_sends')
        .select('date, sent_at, snapshot')
        .eq('tenant_id', tenantId)
        .eq('date', date)
        .order('sent_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    const tagIds = new Set(master.tags.map(t => t.id));
    const jobIds = new Set(master.jobs.map(j => j.id));
    const assignments: Assignment[] = (assigns.data as { tag_id: string; category_id: string; job_id: string }[])
      .filter(a => tagIds.has(a.tag_id) && jobIds.has(a.job_id))
      .map(a => ({ tagId: a.tag_id, categoryId: a.category_id, jobId: a.job_id }));
    const supervisorRow = days.data as { supervisor_ids: string[] } | null;
    const sendRow = send.data as SendRow | null;
    return {
      date,
      assignments,
      notes: Object.fromEntries(
        (notes.data as { job_id: string; category_id: string; text: string }[])
          .filter(n => jobIds.has(n.job_id))
          .map(n => [`${n.job_id}|${n.category_id}`, n.text]),
      ),
      supervisorIds: (supervisorRow?.supervisor_ids ?? []).filter(id => tagIds.has(id)),
      sent: sendRow ? { at: sendRow.sent_at, ...sendRow.snapshot } : undefined,
    };
  };

  const reloadAll = async () => {
    const master = await fetchMaster();
    const dates = Object.keys(storeRef.current.days);
    const days = await Promise.all(dates.map(d => fetchDay(d, master)));
    if (pending.current > 0) return;
    setStore(prev => ({
      ...prev,
      ...master,
      days: Object.fromEntries(days.map(d => [d.date, d])),
    }));
  };

  useEffect(() => {
    fetchMaster().then(master => {
      setStore(prev => ({ ...prev, ...master }));
      setLoading(false);
    });
  }, [tenantId]);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible' && !loading) reloadAll();
    };
    document.addEventListener('visibilitychange', refresh);
    return () => document.removeEventListener('visibilitychange', refresh);
  }, [loading, tenantId]);

  const loadDay = useCallback(
    (date: string) => {
      if (loading) return;
      fetchDay(date, storeRef.current).then(day => {
        if (pending.current > 0 && storeRef.current.days[date]) return;
        setStore(prev => ({ ...prev, days: { ...prev.days, [date]: day } }));
      });
    },
    [loading, tenantId],
  );

  const loadHistory = useCallback(() => {
    supabase
      .from('roster_sends')
      .select('date, sent_at, snapshot')
      .eq('tenant_id', tenantId)
      .order('sent_at', { ascending: false })
      .then(({ data }) => {
        const latest = new Map<string, SendRow>();
        (data as SendRow[]).forEach(row => {
          if (!latest.has(row.date)) latest.set(row.date, row);
        });
        setHistory(
          [...latest.values()]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map(row => ({ date: row.date, sent: { at: row.sent_at, ...row.snapshot } })),
        );
      });
  }, [tenantId]);

  const makeId = () => crypto.randomUUID();
  const day = (date: string) => dayOf(storeRef.current, date);

  const saveSupervisors = (date: string, ids: string[]) =>
    save(supabase.from('roster_days').upsert({ tenant_id: tenantId, date, supervisor_ids: ids }));

  return {
    store,
    loading,
    history,
    getDay: date => store.days[date] ?? emptyDay(date),
    dayLoaded: date => store.days[date] !== undefined,
    loadDay,
    loadHistory,
    assign: (date, tagId, categoryId, jobId) => {
      const wasSupervisor = day(date).supervisorIds.includes(tagId);
      setStore(prev => assignTo(prev, date, tagId, categoryId, jobId));
      save(
        supabase
          .from('assignments')
          .upsert(
            { tenant_id: tenantId, date, tag_id: tagId, category_id: categoryId, job_id: jobId },
            { onConflict: 'tenant_id,date,tag_id' },
          ),
      );
      if (wasSupervisor) saveSupervisors(date, day(date).supervisorIds.filter(id => id !== tagId));
    },
    setSupervisor: (date, tagId) => {
      const ids = [...day(date).supervisorIds.filter(id => id !== tagId), tagId];
      setStore(prev => supervisorOn(prev, date, tagId));
      save(supabase.from('assignments').delete().eq('tenant_id', tenantId).eq('date', date).eq('tag_id', tagId));
      saveSupervisors(date, ids);
    },
    unassign: (date, tagId) => {
      const wasSupervisor = day(date).supervisorIds.includes(tagId);
      setStore(prev => unassignFrom(prev, date, tagId));
      save(supabase.from('assignments').delete().eq('tenant_id', tenantId).eq('date', date).eq('tag_id', tagId));
      if (wasSupervisor) saveSupervisors(date, day(date).supervisorIds.filter(id => id !== tagId));
    },
    setNote: (date, jobId, categoryId, text) => {
      setStore(prev => noteOn(prev, date, jobId, categoryId, text));
      if (text === '') {
        save(
          supabase
            .from('cell_notes')
            .delete()
            .eq('tenant_id', tenantId)
            .eq('date', date)
            .eq('job_id', jobId)
            .eq('category_id', categoryId),
        );
        return;
      }
      save(
        supabase
          .from('cell_notes')
          .upsert(
            { tenant_id: tenantId, date, job_id: jobId, category_id: categoryId, text },
            { onConflict: 'tenant_id,date,job_id,category_id' },
          ),
      );
    },
    markSent: date => {
      const snapshot = snapshotOf(day(date));
      const sent: SentRecord = { at: new Date().toISOString(), ...snapshot };
      setStore(prev => sentOn(prev, date, sent));
      setHistory(prev => [{ date, sent }, ...prev.filter(h => h.date !== date)]);
      save(supabase.from('roster_sends').insert({ tenant_id: tenantId, date, snapshot }));
    },
    addTag: (name, type) => {
      const { added } = tagsAdded(storeRef.current, [name], type, makeId);
      if (added.length === 0) return 'duplicate';
      setStore(prev => ({ ...prev, tags: [...prev.tags, ...added] }));
      save(supabase.from('tags').insert(added.map(t => ({ ...t, tenant_id: tenantId }))));
      return 'added';
    },
    addTags: (names, type) => {
      const { added, skipped } = tagsAdded(storeRef.current, names, type, makeId);
      if (added.length > 0) {
        setStore(prev => ({ ...prev, tags: [...prev.tags, ...added] }));
        save(supabase.from('tags').insert(added.map(t => ({ ...t, tenant_id: tenantId }))));
      }
      return { added: added.length, skipped };
    },
    removeTag: id => {
      const before = storeRef.current;
      setStore(prev => withoutTag(prev, id));
      save(supabase.from('tags').update({ active: false }).eq('id', id));
      return () => {
        setStore(before);
        save(supabase.from('tags').update({ active: true }).eq('id', id));
      };
    },
    addJob: (name, jobNumber) => {
      const { added } = jobsAdded(storeRef.current, [{ name: name.trim(), jobNumber: jobNumber.trim() }], makeId);
      if (added.length === 0) return 'duplicate';
      const order = storeRef.current.jobs.length + 1;
      setStore(prev => ({ ...prev, jobs: [...prev.jobs, ...added] }));
      save(
        supabase.from('jobs').insert(
          added.map(j => ({
            id: j.id,
            tenant_id: tenantId,
            name: j.name,
            job_number: j.jobNumber,
            sort_order: order,
          })),
        ),
      );
      return 'added';
    },
    addJobs: lines => {
      const { added, skipped } = jobsAdded(storeRef.current, lines.map(parseJobLine), makeId);
      if (added.length > 0) {
        const start = storeRef.current.jobs.length + 1;
        setStore(prev => ({ ...prev, jobs: [...prev.jobs, ...added] }));
        save(
          supabase.from('jobs').insert(
            added.map((j, i) => ({
              id: j.id,
              tenant_id: tenantId,
              name: j.name,
              job_number: j.jobNumber,
              sort_order: start + i,
            })),
          ),
        );
      }
      return { added: added.length, skipped };
    },
    updateJob: (id, change) => {
      setStore(prev => ({ ...prev, jobs: prev.jobs.map(j => (j.id === id ? { ...j, ...change } : j)) }));
      save(
        supabase
          .from('jobs')
          .update({
            ...(change.name !== undefined && { name: change.name }),
            ...(change.jobNumber !== undefined && { job_number: change.jobNumber }),
            ...(change.note !== undefined && { note: change.note }),
          })
          .eq('id', id),
      );
    },
    removeJob: id => {
      const before = storeRef.current;
      setStore(prev => withoutJob(prev, id));
      save(supabase.from('jobs').update({ active: false }).eq('id', id));
      return () => {
        setStore(before);
        save(supabase.from('jobs').update({ active: true }).eq('id', id));
      };
    },
    setOperator: (tagId, operatorId) => {
      setStore(prev => operatorOn(prev, tagId, operatorId));
      save(supabase.from('tags').update({ operator_id: operatorId }).eq('id', tagId));
    },
    copyDay: async (from, to) => {
      const source = await fetchDay(from, storeRef.current);
      const target = { tenant_id: tenantId, date: to };
      setStore(prev => copiedFrom({ ...prev, days: { ...prev.days, [from]: source } }, from, to));
      pending.current += 1;
      const results = await Promise.all([
        supabase.from('assignments').delete().eq('tenant_id', tenantId).eq('date', to),
        supabase.from('cell_notes').delete().eq('tenant_id', tenantId).eq('date', to),
      ]);
      const inserts = await Promise.all([
        supabase.from('roster_days').upsert({ ...target, supervisor_ids: source.supervisorIds }),
        source.assignments.length === 0
          ? { error: null }
          : supabase.from('assignments').insert(
              source.assignments.map(a => ({ ...target, tag_id: a.tagId, category_id: a.categoryId, job_id: a.jobId })),
            ),
        Object.keys(source.notes).length === 0
          ? { error: null }
          : supabase.from('cell_notes').insert(
              Object.entries(source.notes).map(([key, text]) => {
                const [jobId, categoryId] = key.split('|');
                return { ...target, job_id: jobId, category_id: categoryId, text };
              }),
            ),
      ]);
      pending.current -= 1;
      if ([...results, ...inserts].some(r => r.error)) {
        toast.error('That change could not be saved. Reloading the latest roster.');
        await reloadAll();
      }
    },
    setOrgName: () => {},
    resetAll: () => {},
  };
}
