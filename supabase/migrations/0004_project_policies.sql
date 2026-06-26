-- RLS policies for the "Project" table (added via the Supabase dashboard),
-- needed so authenticated users can use the Projects CRUD page.
create policy "Authenticated users can view projects"
  on public."Project" for select
  to authenticated
  using (true);

create policy "Authenticated users can insert projects"
  on public."Project" for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update projects"
  on public."Project" for update
  to authenticated
  using (true);

create policy "Authenticated users can delete projects"
  on public."Project" for delete
  to authenticated
  using (true);
