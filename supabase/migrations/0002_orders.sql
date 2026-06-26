-- Example domain table used to back the Reports page (grid + chart).
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  customer_name text not null,
  category text not null,
  amount numeric(10, 2) not null,
  order_date date not null default current_date
);

alter table public.orders enable row level security;

create policy "Orders are viewable by authenticated users"
  on public.orders for select
  to authenticated
  using (true);

insert into public.orders (customer_name, category, amount, order_date) values
  ('Acme Ltd', 'Hardware', 1200.00, current_date - interval '1 month'),
  ('Acme Ltd', 'Software', 450.50, current_date - interval '20 days'),
  ('Beta Corp', 'Hardware', 980.00, current_date - interval '15 days'),
  ('Beta Corp', 'Services', 2100.00, current_date - interval '10 days'),
  ('Gamma Inc', 'Software', 760.25, current_date - interval '5 days'),
  ('Gamma Inc', 'Services', 1340.00, current_date - interval '2 days');
