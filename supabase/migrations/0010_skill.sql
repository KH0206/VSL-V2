create table if not exists public.skill (
  id int generated always as identity primary key,
  skill citext not null,
  description citext not null,
  created_at timestamptz not null default now()
);

alter table public.skill enable row level security;

create policy "skill records are viewable by authenticated users"
  on public.skill for select
  to authenticated
  using (true);

create policy "skill records are insertable by authenticated users"
  on public.skill for insert
  to authenticated
  with check (true);

create policy "skill records are updatable by authenticated users"
  on public.skill for update
  to authenticated
  using (true);

create policy "skill records are deletable by authenticated users"
  on public.skill for delete
  to authenticated
  using (true);

insert into public.skill
(skill, description) values
('driver',     'normal licence'),
('driver_hgv', 'HGV licence')
;
