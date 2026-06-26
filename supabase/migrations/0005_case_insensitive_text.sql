-- Make text columns case-insensitive at the database level (equality, ORDER BY,
-- uniqueness, and pattern matching all ignore case automatically with citext).
create extension if not exists citext;

alter table public."Project"
  alter column project_name type citext;

alter table public.orders
  alter column customer_name type citext,
  alter column category type citext;

alter table public.profiles
  alter column full_name type citext,
  alter column role type citext;
