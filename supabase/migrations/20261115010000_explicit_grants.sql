grant usage on schema public to authenticated;

grant select on public.roles to authenticated;
grant select on public.platform_admins to authenticated;
grant select, insert, update on public.tenants to authenticated;
grant select, update, delete on public.memberships to authenticated;

revoke execute on function public.is_platform_admin() from public, anon;
revoke execute on function public.is_member(uuid) from public, anon;
revoke execute on function public.has_permission(uuid, text) from public, anon;

grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.is_member(uuid) to authenticated;
grant execute on function public.has_permission(uuid, text) to authenticated;
