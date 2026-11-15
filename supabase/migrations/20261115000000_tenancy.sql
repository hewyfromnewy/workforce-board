create table public.roles (
  id text primary key,
  name text not null,
  permissions text[] not null
);

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now()
);

create table public.memberships (
  user_id uuid not null references auth.users (id) on delete cascade,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  role_id text not null references public.roles (id),
  display_name text not null,
  email text not null,
  primary key (user_id, tenant_id)
);

create table public.platform_admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create index memberships_tenant_id_idx on public.memberships (tenant_id);

create function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.platform_admins where user_id = (select auth.uid())
  )
$$;

create function public.is_member(p_tenant uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.memberships
    where user_id = (select auth.uid()) and tenant_id = p_tenant
  )
$$;

create function public.has_permission(p_tenant uuid, p_permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships m
    join public.roles r on r.id = m.role_id
    where m.user_id = (select auth.uid())
      and m.tenant_id = p_tenant
      and p_permission = any (r.permissions)
  )
$$;

alter table public.roles enable row level security;
alter table public.tenants enable row level security;
alter table public.memberships enable row level security;
alter table public.platform_admins enable row level security;

create policy roles_read on public.roles
  for select to authenticated using (true);

create policy tenants_read on public.tenants
  for select to authenticated
  using (public.is_platform_admin() or public.is_member(id));

create policy tenants_insert on public.tenants
  for insert to authenticated
  with check (public.is_platform_admin());

create policy tenants_update on public.tenants
  for update to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy memberships_read on public.memberships
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or public.is_platform_admin()
    or public.is_member(tenant_id)
  );

create policy memberships_update on public.memberships
  for update to authenticated
  using (public.is_platform_admin() or public.has_permission(tenant_id, 'users.manage'))
  with check (public.is_platform_admin() or public.has_permission(tenant_id, 'users.manage'));

create policy memberships_delete on public.memberships
  for delete to authenticated
  using (public.is_platform_admin() or public.has_permission(tenant_id, 'users.manage'));

create policy platform_admins_read on public.platform_admins
  for select to authenticated
  using (user_id = (select auth.uid()));

revoke all on all tables in schema public from anon;

insert into public.roles (id, name, permissions) values
  ('team-member', 'Team Member', array['roster.view']),
  ('supervisor', 'Supervisor', array['roster.view', 'roster.edit', 'roster.send']),
  ('admin', 'Admin', array['roster.view', 'roster.edit', 'roster.send', 'master_data.manage', 'users.manage']);
