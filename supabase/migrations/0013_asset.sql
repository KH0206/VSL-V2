create table if not exists public.asset (
  id int generated always as identity primary key,
  asset_type citext not null,
  make citext not null,
  model citext not null,
  alias citext not null,
  plate citext null,
  build_year int,
  created_at timestamptz not null default now()
);

alter table public.asset enable row level security;

create policy "asset records are viewable by authenticated users"
  on public.asset for select
  to authenticated
  using (true);

create policy "asset records are insertable by authenticated users"
  on public.asset for insert
  to authenticated
  with check (true);

create policy "asset records are updatable by authenticated users"
  on public.asset for update
  to authenticated
  using (true);

create policy "asset records are deletable by authenticated users"
  on public.asset for delete
  to authenticated
  using (true);

insert into public.asset
(asset_type,make,model,alias,plate,build_year) values
('Car','Ford','Fiests','Gary''s Car','BGP001',2021),
('Car','Ford','Fiests','Bert''s Car','BGP002',2022);
