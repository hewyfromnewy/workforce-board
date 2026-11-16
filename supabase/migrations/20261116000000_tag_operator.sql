alter table public.tags
  add column operator_id uuid references public.tags (id) on delete set null;
