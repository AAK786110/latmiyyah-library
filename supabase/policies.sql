-- ============================================================
-- Nauha Library - Row Level Security policies
-- Run this AFTER schema.sql, in the Supabase SQL editor.
--
-- Model: there is exactly one creator account (an authenticated Supabase
-- user). Anyone signed in is treated as the creator, since you said you'll
-- only ever have one creator account. If you later want multiple creator
-- accounts with different permissions, swap the `auth.role() = 'authenticated'`
-- checks below for a real `is_creator` column/role check.
-- ============================================================

alter table latmiyyahs enable row level security;
alter table tags enable row level security;
alter table latmiyyah_tags enable row level security;
alter table submissions enable row level security;
alter table edit_suggestions enable row level security;

-- ---------- latmiyyahs ----------
drop policy if exists "public can read published latmiyyahs" on latmiyyahs;
create policy "public can read published latmiyyahs"
  on latmiyyahs for select
  using (status = 'published' or auth.role() = 'authenticated');

drop policy if exists "creator can insert latmiyyahs" on latmiyyahs;
create policy "creator can insert latmiyyahs"
  on latmiyyahs for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "creator can update latmiyyahs" on latmiyyahs;
create policy "creator can update latmiyyahs"
  on latmiyyahs for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "creator can delete latmiyyahs" on latmiyyahs;
create policy "creator can delete latmiyyahs"
  on latmiyyahs for delete
  using (auth.role() = 'authenticated');

-- ---------- tags ----------
-- Tags themselves aren't sensitive - anyone can read them (needed for
-- filters/explore to work for logged-out visitors). Only the creator can
-- create/edit/delete them.
drop policy if exists "public can read tags" on tags;
create policy "public can read tags"
  on tags for select
  using (true);

drop policy if exists "creator can manage tags" on tags;
create policy "creator can insert tags"
  on tags for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "creator can update tags" on tags;
create policy "creator can update tags"
  on tags for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "creator can delete tags" on tags;
create policy "creator can delete tags"
  on tags for delete
  using (auth.role() = 'authenticated');

-- ---------- latmiyyah_tags ----------
drop policy if exists "public can read latmiyyah_tags" on latmiyyah_tags;
create policy "public can read latmiyyah_tags"
  on latmiyyah_tags for select
  using (true);

drop policy if exists "creator can manage latmiyyah_tags" on latmiyyah_tags;
create policy "creator can insert latmiyyah_tags"
  on latmiyyah_tags for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "creator can delete latmiyyah_tags" on latmiyyah_tags;
create policy "creator can delete latmiyyah_tags"
  on latmiyyah_tags for delete
  using (auth.role() = 'authenticated');

-- ---------- submissions ----------
-- Public users can create a submission but never read any submissions
-- (including their own) - this keeps other people's submissions private
-- and prevents someone scraping the pending queue.
drop policy if exists "public can submit" on submissions;
create policy "public can submit"
  on submissions for insert
  with check (true);

drop policy if exists "creator can read submissions" on submissions;
create policy "creator can read submissions"
  on submissions for select
  using (auth.role() = 'authenticated');

drop policy if exists "creator can update submissions" on submissions;
create policy "creator can update submissions"
  on submissions for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "creator can delete submissions" on submissions;
create policy "creator can delete submissions"
  on submissions for delete
  using (auth.role() = 'authenticated');

-- ---------- edit_suggestions ----------
drop policy if exists "public can suggest edits" on edit_suggestions;
create policy "public can suggest edits"
  on edit_suggestions for insert
  with check (true);

drop policy if exists "creator can read edit_suggestions" on edit_suggestions;
create policy "creator can read edit_suggestions"
  on edit_suggestions for select
  using (auth.role() = 'authenticated');

drop policy if exists "creator can update edit_suggestions" on edit_suggestions;
create policy "creator can update edit_suggestions"
  on edit_suggestions for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "creator can delete edit_suggestions" on edit_suggestions;
create policy "creator can delete edit_suggestions"
  on edit_suggestions for delete
  using (auth.role() = 'authenticated');

-- ============================================================
-- Spam protection notes (see README for more detail):
-- The `submissions` and `edit_suggestions` insert policies above allow
-- anyone to write, which is required for anonymous public forms - but it
-- also means bots can spam them. Mitigations already built into the
-- frontend: a honeypot field on the submission form. For stronger
-- protection, consider adding Cloudflare Turnstile or Google reCAPTCHA to
-- both forms, and/or a Supabase Edge Function that rate-limits by IP
-- before the insert is allowed through.
-- ============================================================
