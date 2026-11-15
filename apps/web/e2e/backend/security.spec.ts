import { createClient } from '@supabase/supabase-js';
import { expect, test } from '@playwright/test';

const client = () => createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

const signedIn = async (email: string) => {
  const supabase = client();
  await supabase.auth.signInWithPassword({ email, password: 'demo-password-1' });
  return supabase;
};

const tenantId = async (supabase: ReturnType<typeof client>) => {
  const { data } = await supabase.from('memberships').select('tenant_id').limit(1).single();
  return data!.tenant_id as string;
};

test('a team member can read the roster data but the database refuses their writes', async () => {
  const member = await signedIn('member@example.com');
  const tenant = await tenantId(member);

  const tags = await member.from('tags').select('id').eq('tenant_id', tenant);
  expect(tags.data!.length).toBeGreaterThan(0);

  const insertTag = await member.from('tags').insert({ tenant_id: tenant, name: 'Sneaky', type: 'member' });
  expect(insertTag.error).not.toBeNull();

  const insertAssignment = await member.from('assignments').insert({
    tenant_id: tenant,
    date: '2099-01-01',
    tag_id: tags.data![0].id,
    category_id: 'personnel',
    job_id: (await member.from('jobs').select('id').eq('tenant_id', tenant).limit(1).single()).data!.id,
  });
  expect(insertAssignment.error).not.toBeNull();
});

test('a supervisor can plan and send but cannot change the master lists', async () => {
  const supervisor = await signedIn('supervisor@example.com');
  const tenant = await tenantId(supervisor);

  const insertTag = await supervisor.from('tags').insert({ tenant_id: tenant, name: 'Sneaky', type: 'member' });
  expect(insertTag.error).not.toBeNull();

  const send = await supervisor.from('roster_sends').insert({ tenant_id: tenant, date: '2099-01-02', snapshot: { assignments: [], notes: {}, supervisorIds: [] } });
  expect(send.error).toBeNull();
});

test('the platform admin cannot read any tenant roster data', async () => {
  const platform = await signedIn('platform@example.com');

  const tags = await platform.from('tags').select('id');
  expect(tags.data).toEqual([]);

  const jobs = await platform.from('jobs').select('id');
  expect(jobs.data).toEqual([]);
});

test('a signed-out visitor sees nothing', async () => {
  const anon = client();
  const tags = await anon.from('tags').select('id');
  expect(tags.data ?? []).toEqual([]);
});
