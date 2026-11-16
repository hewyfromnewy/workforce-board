alter table public.assignments
  add column on_tag_id uuid references public.tags (id) on delete cascade;
