-- Junction table linking person <-> skill (many-to-many).
-- Surrogate id (rather than a composite PK) leaves room to add columns later
-- (e.g. proficiency, certified_at) without restructuring the table.
create table if not exists public.person_skill_link (
  id int generated always as identity primary key,
  person_id int not null references public.person (id) on delete cascade,
  skill_id int not null references public.skill (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (person_id, skill_id)
);

alter table public.person_skill_link enable row level security;

create policy "person_skill_link records are viewable by authenticated users"
  on public.person_skill_link for select
  to authenticated
  using (true);

create policy "person_skill_link records are insertable by authenticated users"
  on public.person_skill_link for insert
  to authenticated
  with check (true);

create policy "person_skill_link records are updatable by authenticated users"
  on public.person_skill_link for update
  to authenticated
  using (true);

create policy "person_skill_link records are deletable by authenticated users"
  on public.person_skill_link for delete
  to authenticated
  using (true);
