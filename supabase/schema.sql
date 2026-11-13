-- CIPHER CHRONICLES: run this in Supabase SQL Editor.
-- After creating your Supabase Auth user, insert that user's UUID into admin_users.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.notebook_pages (
  id uuid primary key default gen_random_uuid(),
  chapter text not null default 'PERSONAL NOTES',
  title text not null default 'Untitled page',
  lead text not null default '',
  body_html text not null default '<p>Start writing your notes here…</p>',
  sort_order integer not null default 100,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notebook_pages_public_order
  on public.notebook_pages(status, sort_order);

alter table public.admin_users enable row level security;
alter table public.notebook_pages enable row level security;

-- Admin membership is intentionally not publicly readable or writable.
create policy "Admins can read their own membership"
on public.admin_users for select to authenticated
using (user_id = auth.uid());

-- Visitors can read published pages only.
create policy "Anyone can read published pages"
on public.notebook_pages for select to anon, authenticated
using (status = 'published');

-- Admins can read all pages and manage content.
create policy "Admins can read all notebook pages"
on public.notebook_pages for select to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "Admins can insert notebook pages"
on public.notebook_pages for insert to authenticated
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "Admins can update notebook pages"
on public.notebook_pages for update to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "Admins can delete notebook pages"
on public.notebook_pages for delete to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- Optional starter articles can be added from the admin dashboard.
