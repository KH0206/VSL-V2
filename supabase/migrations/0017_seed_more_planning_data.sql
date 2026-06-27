-- Expand MVP dataset for planning screens (idempotent).
-- Adds additional projects, people, assets, allocations, and tasks.

-- More customer and internal projects.
insert into public.project (project_name, project_type, is_active)
select v.project_name::citext, v.project_type::citext, true
from (
  values
    ('Airport Upgrade', 'customer'),
    ('Bridge Inspection', 'customer'),
    ('Depot Refit', 'customer'),
    ('Rail Corridor Survey', 'customer'),
    ('Solar Site Prep', 'customer'),
    ('Warehouse Automation', 'customer'),
    ('Fleet Renewal', 'customer'),
    ('Q3 Training Program', 'inhouse'),
    ('Tooling Refresh', 'inhouse'),
    ('Safety Audit Cycle', 'inhouse')
) as v(project_name, project_type)
where not exists (
  select 1
  from public.project p
  where p.project_name = v.project_name::citext
);

-- More people for assignment density.
insert into public.person (name, firstname, lastname, phone, whatsapp, is_active)
select
  v.firstname::citext,
  v.firstname::citext,
  v.lastname::citext,
  v.phone,
  v.whatsapp,
  true
from (
  values
    ('Olivia', 'Reed', '+44 7000 100001', '+44 7000 100001'),
    ('Ethan', 'Carter', '+44 7000 100002', '+44 7000 100002'),
    ('Mia', 'Patel', '+44 7000 100003', '+44 7000 100003'),
    ('Noah', 'Bennett', '+44 7000 100004', null),
    ('Ava', 'Morris', '+44 7000 100005', '+44 7000 100005'),
    ('Liam', 'Foster', '+44 7000 100006', null),
    ('Isla', 'Turner', '+44 7000 100007', '+44 7000 100007'),
    ('Lucas', 'Hughes', '+44 7000 100008', '+44 7000 100008'),
    ('Sofia', 'Ward', '+44 7000 100009', null),
    ('Henry', 'Baker', '+44 7000 100010', '+44 7000 100010'),
    ('Grace', 'Cook', '+44 7000 100011', '+44 7000 100011'),
    ('Jack', 'Brooks', '+44 7000 100012', null)
) as v(firstname, lastname, phone, whatsapp)
where not exists (
  select 1
  from public.person pe
  where pe.firstname = v.firstname::citext
    and pe.lastname = v.lastname::citext
);

-- More assets for schedule variety.
insert into public.asset (asset_type, make, model, alias, plate, build_year, is_active)
select
  v.asset_type::citext,
  v.make::citext,
  v.model::citext,
  v.alias::citext,
  v.plate::citext,
  v.build_year,
  true
from (
  values
    ('Car', 'Toyota', 'Hilux', 'Raptor 1', 'BGP101', 2020),
    ('Car', 'Toyota', 'Hilux', 'Raptor 2', 'BGP102', 2021),
    ('Car', 'Ford', 'Transit', 'Transit A', 'BGP103', 2019),
    ('Car', 'Ford', 'Transit', 'Transit B', 'BGP104', 2022),
    ('Trailer', 'Ifor', 'Plant 8x4', 'Trailer North', 'BGP201', 2018),
    ('Trailer', 'Ifor', 'Plant 10x5', 'Trailer South', 'BGP202', 2020),
    ('Generator', 'CAT', 'C3.3', 'Gen Alpha', 'BGP301', 2017),
    ('Generator', 'CAT', 'C3.3', 'Gen Bravo', 'BGP302', 2019),
    ('Drone', 'DJI', 'Matrice 300', 'Drone East', 'BGP401', 2023),
    ('Drone', 'DJI', 'Matrice 300', 'Drone West', 'BGP402', 2023)
) as v(asset_type, make, model, alias, plate, build_year)
where not exists (
  select 1
  from public.asset a
  where a.alias = v.alias::citext
);

-- Additional project allocations (mix of person and asset assignments).
with seed_allocation as (
  select *
  from (
    values
      ('Airport Upgrade', 'Olivia Reed', null, -20, 8, 'Survey lead'),
      ('Airport Upgrade', 'Ethan Carter', null, -12, 10, 'Safety checks'),
      ('Airport Upgrade', null, 'Drone East', -22, 15, 'Aerial mapping'),
      ('Bridge Inspection', 'Mia Patel', null, -18, 9, 'Inspection report'),
      ('Bridge Inspection', null, 'Gen Alpha', -16, 11, 'Power support'),
      ('Depot Refit', 'Noah Bennett', null, -10, 14, 'Refit supervision'),
      ('Depot Refit', null, 'Transit A', -8, 13, 'Material runs'),
      ('Rail Corridor Survey', 'Ava Morris', null, -24, 12, 'Route planning'),
      ('Rail Corridor Survey', null, 'Drone West', -24, 12, 'Imagery pass'),
      ('Solar Site Prep', 'Liam Foster', null, -6, 9, 'Ground prep'),
      ('Solar Site Prep', null, 'Raptor 1', -5, 9, 'Crew transport'),
      ('Warehouse Automation', 'Isla Turner', null, -14, 16, 'System commissioning'),
      ('Warehouse Automation', null, 'Transit B', -14, 16, 'Delivery support'),
      ('Fleet Renewal', 'Lucas Hughes', null, -3, 20, 'Procurement tracking'),
      ('Fleet Renewal', null, 'Trailer North', -2, 19, 'Asset transfers'),
      ('Q3 Training Program', 'Sofia Ward', null, 2, 12, 'Training coordinator'),
      ('Q3 Training Program', null, 'Raptor 2', 2, 12, 'Trainer transport'),
      ('Tooling Refresh', 'Henry Baker', null, 4, 10, 'Tool audit'),
      ('Tooling Refresh', null, 'Trailer South', 4, 10, 'Tool distribution'),
      ('Safety Audit Cycle', 'Grace Cook', null, 7, 8, 'Audit lead'),
      ('Safety Audit Cycle', null, 'Gen Bravo', 7, 8, 'On-site power'),
      ('InHouse', 'Jack Brooks', null, -4, 7, 'Internal support'),
      ('InHouse', null, 'Transit A', -4, 7, 'Logistics backup'),
      ('InHouse', 'Olivia Reed', null, 10, 5, 'Planning workshop')
  ) as s(project_name, person_name, asset_alias, start_offset, duration_days, notes)
)
insert into public.project_allocation (project_id, person_id, asset_id, starts_on, ends_on, notes)
select
  p.id,
  pe.id,
  a.id,
  current_date + s.start_offset,
  current_date + s.start_offset + s.duration_days,
  s.notes::citext
from seed_allocation s
join public.project p
  on p.project_name = s.project_name::citext
left join public.person pe
  on (pe.firstname::text || ' ' || pe.lastname::text) = s.person_name
left join public.asset a
  on a.alias = s.asset_alias::citext
where (pe.id is not null or a.id is not null)
  and not exists (
    select 1
    from public.project_allocation pa
    where pa.project_id = p.id
      and coalesce(pa.person_id, -1) = coalesce(pe.id, -1)
      and coalesce(pa.asset_id, -1) = coalesce(a.id, -1)
      and pa.starts_on = current_date + s.start_offset
      and pa.ends_on = current_date + s.start_offset + s.duration_days
  );

-- Additional tasks tied to projects/people/assets.
with seed_task as (
  select *
  from (
    values
      ('Runway perimeter survey', 'Airport Upgrade', 'Olivia Reed', null, -20, 4, 'in_progress', 'Initial survey walkdown'),
      ('Lighting compliance pass', 'Airport Upgrade', 'Ethan Carter', null, -12, 5, 'planned', 'Night shift inspection'),
      ('Bridge load checklist', 'Bridge Inspection', 'Mia Patel', null, -18, 6, 'in_progress', 'Checklist and evidence pack'),
      ('Depot electrical review', 'Depot Refit', 'Noah Bennett', null, -9, 7, 'planned', 'Electrical cabinets and panel review'),
      ('Rail imagery batch 01', 'Rail Corridor Survey', 'Ava Morris', 'Drone East', -24, 3, 'done', 'Imagery collected'),
      ('Rail imagery batch 02', 'Rail Corridor Survey', 'Ava Morris', 'Drone West', -20, 3, 'in_progress', 'Secondary pass'),
      ('Ground stakeout', 'Solar Site Prep', 'Liam Foster', null, -6, 4, 'planned', 'Marking trench lines'),
      ('Automation rack fit', 'Warehouse Automation', 'Isla Turner', null, -14, 10, 'in_progress', 'Fit and verify control racks'),
      ('Fleet bid review', 'Fleet Renewal', 'Lucas Hughes', null, -3, 12, 'planned', 'Evaluate bids'),
      ('Trainer induction', 'Q3 Training Program', 'Sofia Ward', null, 2, 6, 'planned', 'Kickoff and induction'),
      ('Tool stock count', 'Tooling Refresh', 'Henry Baker', null, 4, 5, 'planned', 'Warehouse and van stock count'),
      ('Audit prep meeting', 'Safety Audit Cycle', 'Grace Cook', null, 7, 3, 'planned', 'Audit readiness session'),
      ('Internal process tidy-up', 'InHouse', 'Jack Brooks', null, -4, 5, 'in_progress', 'Backlog cleanup')
  ) as t(title, project_name, person_name, asset_alias, start_offset, duration_days, status, details)
)
insert into public.task (title, details, project_id, person_id, asset_id, starts_on, ends_on, status)
select
  t.title::citext,
  t.details,
  p.id,
  pe.id,
  a.id,
  current_date + t.start_offset,
  current_date + t.start_offset + t.duration_days,
  t.status::citext
from seed_task t
join public.project p
  on p.project_name = t.project_name::citext
join public.person pe
  on (pe.firstname::text || ' ' || pe.lastname::text) = t.person_name
left join public.asset a
  on a.alias = t.asset_alias::citext
where not exists (
  select 1
  from public.task tk
  where tk.title = t.title::citext
    and tk.project_id = p.id
    and tk.person_id = pe.id
    and coalesce(tk.asset_id, -1) = coalesce(a.id, -1)
    and tk.starts_on = current_date + t.start_offset
);
