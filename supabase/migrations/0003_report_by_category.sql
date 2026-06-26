-- Example "stored procedure" (Postgres function), called via supabase.rpc('report_totals_by_category').
-- Demonstrates running custom server-side logic instead of plain table selects.
create or replace function public.report_totals_by_category()
returns table (category text, total_amount numeric, order_count bigint)
language sql
stable
as $$
  select category, sum(amount) as total_amount, count(*) as order_count
  from public.orders
  group by category
  order by total_amount desc;
$$;
