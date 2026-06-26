-- Rename "Project" to lowercase "project" for consistency with other tables
-- (avoids needing quoted identifiers everywhere). RLS policies, indexes, and
-- data are preserved automatically by Postgres.
alter table public."Project" rename to project;
