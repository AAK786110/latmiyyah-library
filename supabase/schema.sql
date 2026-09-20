-- ============================================================
-- Nauha Library - Supabase schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query)
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm; -- enables fast fuzzy/ILIKE search

-- ---------- latmiyyahs ----------
create table if not exists latmiyyahs (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  arabic_title text,
  reciter text not null,
  poet text,
  arabic_text text not null default '',
  english_translation text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_latmiyyahs_status on latmiyyahs (status);
create index if not exists idx_latmiyyahs_reciter on latmiyyahs (reciter);
create index if not exists idx_latmiyyahs_title_trgm on latmiyyahs using gin (title gin_trgm_ops);
create index if not exists idx_latmiyyahs_reciter_trgm on latmiyyahs using gin (reciter gin_trgm_ops);

-- Keep updated_at current on every edit
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_latmiyyahs_updated_at on latmiyyahs;
create trigger trg_latmiyyahs_updated_at
  before update on latmiyyahs
  for each row execute function set_updated_at();

-- ---------- tags ----------
create table if not exists tags (
  id uuid primary key default uuid_generate_v4(),
  category text not null check (category in ('holy_personality', 'context', 'speed')),
  name text not null,
  slug text not null,
  unique (category, slug)
);

-- ---------- latmiyyah_tags (many-to-many) ----------
create table if not exists latmiyyah_tags (
  latmiyyah_id uuid not null references latmiyyahs (id) on delete cascade,
  tag_id uuid not null references tags (id) on delete cascade,
  primary key (latmiyyah_id, tag_id)
);

create index if not exists idx_latmiyyah_tags_tag on latmiyyah_tags (tag_id);
create index if not exists idx_latmiyyah_tags_latmiyyah on latmiyyah_tags (latmiyyah_id);

-- ---------- submissions (public "Add Your Own") ----------
create table if not exists submissions (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  arabic_title text,
  reciter text,
  poet text,
  arabic_text text,
  english_translation text,
  proposed_tags text,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

-- ---------- edit_suggestions ----------
create table if not exists edit_suggestions (
  id uuid primary key default uuid_generate_v4(),
  latmiyyah_id uuid not null references latmiyyahs (id) on delete cascade,
  field text not null,
  current_value text,
  suggested_value text not null,
  note text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists idx_edit_suggestions_latmiyyah on edit_suggestions (latmiyyah_id);

-- ---------- seed a starter set of tags (feel free to add more anytime) ----------
insert into tags (category, name, slug) values
  ('holy_personality', 'Imam Husayn', 'imam-husayn'),
  ('holy_personality', 'Hazrat Abbas', 'hazrat-abbas'),
  ('holy_personality', 'Sayyida Zaynab', 'sayyida-zaynab'),
  ('holy_personality', 'Sayyida Fatima al-Zahra', 'sayyida-fatima-al-zahra'),
  ('holy_personality', 'Imam Ali', 'imam-ali'),
  ('context', 'Muharram', 'muharram'),
  ('context', 'Ashura', 'ashura'),
  ('context', 'Arbaeen', 'arbaeen'),
  ('context', 'Shahadah', 'shahadah'),
  ('context', 'Wiladah / Celebration', 'wiladah-celebration'),
  ('context', 'Karbala', 'karbala'),
  ('speed', 'Slow', 'slow'),
  ('speed', 'Medium', 'medium'),
  ('speed', 'Fast', 'fast')
on conflict (category, slug) do nothing;
