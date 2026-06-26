create table if not exists public.person (
  id int generated always as identity primary key,
  name citext not null,
  firstname citext not null,
  lastname citext not null,
  phone text null,
  whatsapp text null,
  created_at timestamptz not null default now()
);

alter table public.person enable row level security;

create policy "Person records are viewable by authenticated users"
  on public.person for select
  to authenticated
  using (true);

create policy "Person records are insertable by authenticated users"
  on public.person for insert
  to authenticated
  with check (true);

create policy "Person records are updatable by authenticated users"
  on public.person for update
  to authenticated
  using (true);

create policy "Person records are deletable by authenticated users"
  on public.person for delete
  to authenticated
  using (true);

insert into public.person
(name, firstname, lastname, phone, whatsapp) values
('Alex', 'Alexander', 'Example', '+44 7000 000001', '+44 7000 000001'),
('Sam', 'Samantha', 'Sample', '+44 7000 000002', '+44 7000 000002'),
('Jordan', 'Jordan', 'Placeholder', '+44 7000 000003', null);
