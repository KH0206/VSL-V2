create table if not exists public.project_allocation (
  id int generated always as identity primary key,
  project_id int not null references public.project (id) on delete cascade,
  person_id int references public.person (id) on delete set null,
  asset_id int references public.asset (id) on delete set null,
  starts_on date not null,
  ends_on date not null,
  notes citext,
  created_at timestamptz not null default now(),
  constraint project_allocation_dates_valid check (ends_on >= starts_on),
  constraint project_allocation_has_resource check (person_id is not null or asset_id is not null)
);

create index if not exists idx_project_allocation_project on public.project_allocation (project_id);
create index if not exists idx_project_allocation_dates on public.project_allocation (starts_on, ends_on);

alter table public.project_allocation enable row level security;

create policy "project allocation records are viewable by authenticated users"
  on public.project_allocation for select
  to authenticated
  using (true);

create policy "project allocation records are insertable by authenticated users"
  on public.project_allocation for insert
  to authenticated
  with check (true);

create policy "project allocation records are updatable by authenticated users"
  on public.project_allocation for update
  to authenticated
  using (true);

create policy "project allocation records are deletable by authenticated users"
  on public.project_allocation for delete
  to authenticated
  using (true);

with first_project as (
  select id from public.project order by id asc limit 1
),
first_person as (
  select id from public.person order by id asc limit 1
),
first_asset as (
  select id from public.asset order by id asc limit 1
)
insert into public.project_allocation (project_id, person_id, asset_id, starts_on, ends_on, notes)
select p.id, pe.id, null, current_date - 10, current_date + 10, 'Initial person allocation'
from first_project p
join first_person pe on true
where not exists (select 1 from public.project_allocation)
union all
select p.id, null, a.id, current_date - 5, current_date + 14, 'Initial asset allocation'
from first_project p
join first_asset a on true
where not exists (select 1 from public.project_allocation);
