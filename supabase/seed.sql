insert into public.tenants (id, name) values
  ('00000000-0000-0000-0000-0000000000a1', 'Demo Works Team'),
  ('00000000-0000-0000-0000-0000000000a2', 'Riverside Depot');

create temporary table demo_users (id uuid, email text, name text);
insert into demo_users values
  ('00000000-0000-0000-0000-0000000000b1', 'platform@example.com', 'Pat Platform'),
  ('00000000-0000-0000-0000-0000000000b2', 'admin@example.com', 'Alex Admin'),
  ('00000000-0000-0000-0000-0000000000b3', 'supervisor@example.com', 'Sam Supervisor'),
  ('00000000-0000-0000-0000-0000000000b4', 'member@example.com', 'Tessa Team');

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select
  '00000000-0000-0000-0000-000000000000', id, 'authenticated', 'authenticated', email,
  crypt('demo-password-1', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', jsonb_build_object('display_name', name), now(), now(),
  '', '', '', ''
from demo_users;

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), id, id::text, 'email',
  jsonb_build_object('sub', id::text, 'email', email), now(), now(), now()
from demo_users;

insert into public.platform_admins (user_id) values ('00000000-0000-0000-0000-0000000000b1');

insert into public.memberships (user_id, tenant_id, role_id, display_name, email)
select id, '00000000-0000-0000-0000-0000000000a1',
  case email when 'admin@example.com' then 'admin' when 'supervisor@example.com' then 'supervisor' else 'team-member' end,
  name, email
from demo_users
where email <> 'platform@example.com';

insert into public.tags (tenant_id, name, type) values
  ('00000000-0000-0000-0000-0000000000a1', 'John Smith', 'member'),
  ('00000000-0000-0000-0000-0000000000a1', 'Sarah Johnson', 'member'),
  ('00000000-0000-0000-0000-0000000000a1', 'Mike Davis', 'member'),
  ('00000000-0000-0000-0000-0000000000a1', 'Emma Wilson', 'member'),
  ('00000000-0000-0000-0000-0000000000a1', 'Chris Brown', 'member'),
  ('00000000-0000-0000-0000-0000000000a1', 'Lisa Anderson', 'member'),
  ('00000000-0000-0000-0000-0000000000a1', 'Excavator #1', 'asset'),
  ('00000000-0000-0000-0000-0000000000a1', 'Truck #23', 'asset'),
  ('00000000-0000-0000-0000-0000000000a1', 'Roller #8', 'asset'),
  ('00000000-0000-0000-0000-0000000000a1', 'Hire Excavator', 'hire'),
  ('00000000-0000-0000-0000-0000000000a1', 'Traffic Control Crew', 'hire');

insert into public.jobs (tenant_id, name, job_number, note, sort_order) values
  ('00000000-0000-0000-0000-0000000000a1', 'North Depot', '', '', 1),
  ('00000000-0000-0000-0000-0000000000a1', 'River Road', '', '', 2),
  ('00000000-0000-0000-0000-0000000000a1', 'Park Street', '', '', 3),
  ('00000000-0000-0000-0000-0000000000a1', 'Stockpile', '', '', 4);
