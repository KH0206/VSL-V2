-- Switch identity columns from bigint to int across tables that use one.
-- profiles.id stays uuid (foreign key to auth.users.id) and is not affected.
alter table public.orders
  alter column id type int;

alter table public.project
  alter column id type int;
