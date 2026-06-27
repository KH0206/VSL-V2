-- MVP task model for lightweight scheduling with SQL-driven overlap highlighting.
-- Extends core entities minimally, adds default InHouse project behavior, and
-- creates overlap views for person/asset conflict detection.

-- Minimal extensions on existing entities for operational toggles/classification.
alter table public.project
  add column if not exists project_type citext not null default 'customer',
  add column if not exists is_active boolean not null default true;

alter table public.person
  add column if not exists is_active boolean not null default true;

alter table public.asset
  add column if not exists is_active boolean not null default true;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'project_project_type_valid'
      and conrelid = 'public.project'::regclass
  ) then
    alter table public.project
      add constraint project_project_type_valid
      check (project_type in ('customer', 'inhouse'));
  end if;
end $$;

-- Ensure the fallback non-customer project exists.
insert into public.project (project_name, project_type, is_active)
select 'InHouse', 'inhouse', true
where not exists (
  select 1 from public.project where project_name = 'InHouse'
);

update public.project
set project_type = 'inhouse',
    is_active = true
where project_name = 'InHouse';

create table if not exists public.task (
  id int generated always as identity primary key,
  title citext not null,
  details text null,
  project_id int not null references public.project (id) on delete restrict,
  person_id int not null references public.person (id) on delete restrict,
  asset_id int null references public.asset (id) on delete set null,
  starts_on date not null,
  ends_on date not null,
  status citext not null default 'planned',
  created_at timestamptz not null default now(),
  constraint task_dates_valid check (ends_on >= starts_on),
  constraint task_status_valid check (status in ('planned', 'in_progress', 'done', 'blocked'))
);

create index if not exists idx_task_project on public.task (project_id);
create index if not exists idx_task_person_dates on public.task (person_id, starts_on, ends_on);
create index if not exists idx_task_asset_dates on public.task (asset_id, starts_on, ends_on);

-- If caller omits project_id, attach task to InHouse by default.
create or replace function public.task_set_default_project()
returns trigger
language plpgsql
as $$
declare
  inhouse_project_id int;
begin
  if new.project_id is null then
    select id
    into inhouse_project_id
    from public.project
    where project_name = 'InHouse'
    order by id
    limit 1;

    if inhouse_project_id is null then
      raise exception 'InHouse project missing; cannot default task.project_id';
    end if;

    new.project_id := inhouse_project_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_task_default_project on public.task;
create trigger trg_task_default_project
before insert or update of project_id on public.task
for each row
execute function public.task_set_default_project();

alter table public.task enable row level security;

create policy "task records are viewable by authenticated users"
  on public.task for select
  to authenticated
  using (true);

create policy "task records are insertable by authenticated users"
  on public.task for insert
  to authenticated
  with check (true);

create policy "task records are updatable by authenticated users"
  on public.task for update
  to authenticated
  using (true);

create policy "task records are deletable by authenticated users"
  on public.task for delete
  to authenticated
  using (true);

-- Pairwise overlaps (same person or same asset, overlapping date ranges).
create or replace view public.task_overlaps as
select
  t1.id as task_id,
  t2.id as overlaps_with_task_id,
  case
    when t1.person_id = t2.person_id then 'person'
    else 'asset'
  end as overlap_type,
  greatest(t1.starts_on, t2.starts_on) as overlap_starts_on,
  least(t1.ends_on, t2.ends_on) as overlap_ends_on
from public.task t1
join public.task t2
  on t1.id < t2.id
 and daterange(t1.starts_on, t1.ends_on, '[]') && daterange(t2.starts_on, t2.ends_on, '[]')
 and (
   t1.person_id = t2.person_id
   or (
     t1.asset_id is not null
     and t2.asset_id is not null
     and t1.asset_id = t2.asset_id
   )
 );

-- Per-task conflict summary for easy coloring in UI.
create or replace view public.task_overlap_summary as
with per_task as (
  select task_id as id, overlap_type from public.task_overlaps
  union all
  select overlaps_with_task_id as id, overlap_type from public.task_overlaps
)
select
  t.id as task_id,
  count(p.id) as overlap_count,
  bool_or(p.overlap_type = 'person') as has_person_overlap,
  bool_or(p.overlap_type = 'asset') as has_asset_overlap
from public.task t
left join per_task p on p.id = t.id
group by t.id;

-- Helpful starter row if data exists.
with inhouse as (
  select id from public.project where project_name = 'InHouse' order by id asc limit 1
),
first_person as (
  select id from public.person order by id asc limit 1
)
insert into public.task (title, details, project_id, person_id, starts_on, ends_on, status)
select
  'Internal planning',
  'Initial non-customer task',
  i.id,
  p.id,
  current_date,
  current_date + 7,
  'planned'
from inhouse i
join first_person p on true
where not exists (select 1 from public.task);
