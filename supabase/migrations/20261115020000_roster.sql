create table public.tags (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  name text not null,
  type text not null check (type in ('member', 'asset', 'hire')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  name text not null,
  job_number text not null default '',
  note text not null default '',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.roster_days (
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  date date not null,
  supervisor_ids uuid[] not null default '{}',
  primary key (tenant_id, date)
);

create table public.assignments (
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  date date not null,
  tag_id uuid not null references public.tags (id) on delete cascade,
  category_id text not null,
  job_id uuid not null references public.jobs (id) on delete cascade,
  primary key (tenant_id, date, tag_id)
);

create table public.cell_notes (
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  date date not null,
  job_id uuid not null references public.jobs (id) on delete cascade,
  category_id text not null,
  text text not null,
  primary key (tenant_id, date, job_id, category_id)
);

create table public.roster_sends (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  date date not null,
  sent_at timestamptz not null default now(),
  sent_by uuid not null default auth.uid() references auth.users (id),
  snapshot jsonb not null
);

create index tags_tenant_id_idx on public.tags (tenant_id);
create index jobs_tenant_id_idx on public.jobs (tenant_id);
create index assignments_tenant_date_idx on public.assignments (tenant_id, date);
create index cell_notes_tenant_date_idx on public.cell_notes (tenant_id, date);
create index roster_sends_tenant_date_idx on public.roster_sends (tenant_id, date, sent_at desc);

alter table public.tags enable row level security;
alter table public.jobs enable row level security;
alter table public.roster_days enable row level security;
alter table public.assignments enable row level security;
alter table public.cell_notes enable row level security;
alter table public.roster_sends enable row level security;

create policy tags_read on public.tags for select to authenticated
  using (public.is_member(tenant_id));
create policy tags_write on public.tags for all to authenticated
  using (public.has_permission(tenant_id, 'master_data.manage'))
  with check (public.has_permission(tenant_id, 'master_data.manage'));

create policy jobs_read on public.jobs for select to authenticated
  using (public.is_member(tenant_id));
create policy jobs_write on public.jobs for all to authenticated
  using (public.has_permission(tenant_id, 'master_data.manage'))
  with check (public.has_permission(tenant_id, 'master_data.manage'));

create policy roster_days_read on public.roster_days for select to authenticated
  using (public.is_member(tenant_id));
create policy roster_days_write on public.roster_days for all to authenticated
  using (public.has_permission(tenant_id, 'roster.edit'))
  with check (public.has_permission(tenant_id, 'roster.edit'));

create policy assignments_read on public.assignments for select to authenticated
  using (public.is_member(tenant_id));
create policy assignments_write on public.assignments for all to authenticated
  using (public.has_permission(tenant_id, 'roster.edit'))
  with check (public.has_permission(tenant_id, 'roster.edit'));

create policy cell_notes_read on public.cell_notes for select to authenticated
  using (public.is_member(tenant_id));
create policy cell_notes_write on public.cell_notes for all to authenticated
  using (public.has_permission(tenant_id, 'roster.edit'))
  with check (public.has_permission(tenant_id, 'roster.edit'));

create policy roster_sends_read on public.roster_sends for select to authenticated
  using (public.is_member(tenant_id));
create policy roster_sends_insert on public.roster_sends for insert to authenticated
  with check (public.has_permission(tenant_id, 'roster.send') and sent_by = (select auth.uid()));

revoke all on public.tags, public.jobs, public.roster_days, public.assignments, public.cell_notes, public.roster_sends from anon;

grant select, insert, update, delete on public.tags to authenticated;
grant select, insert, update, delete on public.jobs to authenticated;
grant select, insert, update, delete on public.roster_days to authenticated;
grant select, insert, update, delete on public.assignments to authenticated;
grant select, insert, update, delete on public.cell_notes to authenticated;
grant select, insert on public.roster_sends to authenticated;
