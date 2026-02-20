-- 1) 创建 notes 表（支持文字或图片二选一）
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  content text,
  image_url text,
  created_at timestamptz not null default now(),
  constraint notes_content_or_image_check
    check (nullif(trim(content), '') is not null or image_url is not null)
);

-- 2) 兼容已存在表：放宽字段 + 添加约束
alter table public.notes
  alter column content drop not null,
  alter column image_url drop not null;

alter table public.notes
  drop constraint if exists notes_content_or_image_check;

alter table public.notes
  add constraint notes_content_or_image_check
    check (nullif(trim(content), '') is not null or image_url is not null);

alter table public.notes enable row level security;

-- 3) 访客可读
drop policy if exists "Public can read notes" on public.notes;
create policy "Public can read notes"
on public.notes
for select
to anon, authenticated
using (true);

-- 4) 允许发布（最简方案：匿名也可写）
drop policy if exists "Public can insert notes" on public.notes;
create policy "Public can insert notes"
on public.notes
for insert
to anon, authenticated
with check (nullif(trim(content), '') is not null or image_url is not null);

-- 5) 创建公开图片桶
insert into storage.buckets (id, name, public)
values ('notes-images', 'notes-images', true)
on conflict (id) do nothing;

-- 6) 访客可读图片
drop policy if exists "Public can read images" on storage.objects;
create policy "Public can read images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'notes-images');

-- 7) 允许上传图片（最简方案：匿名也可写）
drop policy if exists "Public can upload images" on storage.objects;
create policy "Public can upload images"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'notes-images');
