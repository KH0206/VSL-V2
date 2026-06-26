# Webapp

Next.js (App Router) + Supabase starter with authentication, user management,
custom stored-procedure calls, AG Grid tables, Recharts, and test stubs.

## Stack

- Next.js 16 + TypeScript + Tailwind CSS
- Supabase (Postgres + Auth) via `@supabase/ssr`
- shadcn/ui components
- AG Grid Community (data tables)
- Recharts (charts)
- Vitest + Testing Library (tests)

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project (free tier is fine).
2. In the project dashboard, go to **Project Settings -> API** and copy:
   - Project URL
   - `anon` public key

## 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Run the database migrations

The SQL files in `supabase/migrations/` set up:

- `0001_profiles.sql` — a `profiles` table (linked to `auth.users`) with role-based RLS, and a trigger that creates a profile row whenever a new user signs up.
- `0002_orders.sql` — an example `orders` table with seed data, used by the Reports page.
- `0003_report_by_category.sql` — an example **Postgres function** (the Postgres equivalent of a stored procedure), called from the app via `supabase.rpc('report_totals_by_category')`. Use this as the pattern for any custom stored procedures you need.

Run them either via the Supabase SQL Editor (paste each file's contents in order), or with the Supabase CLI:

```bash
npx supabase login
npx supabase link --project-ref your-project-ref
npx supabase db push
```

## 4. Install dependencies and run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`, sign up for an account, and you'll be redirected
to `/dashboard`. `/users` shows the AG Grid user list (from `profiles`), and
`/reports` shows an AG Grid table + Recharts bar chart driven by the
`report_totals_by_category` stored procedure, with CSV export.

## 5. Run tests

```bash
npm test
```

## Calling your own stored procedures

1. Add a new Postgres function in a migration file under `supabase/migrations/`, following the pattern in `0003_report_by_category.sql`.
2. Call it from a Server Component or Server Action with:

```ts
const { data, error } = await supabase.rpc("your_function_name", { param1: value });
```

## Project structure

```
src/
  app/
    (app)/            # authenticated routes (layout checks session)
      dashboard/
      users/
      reports/
    login/
    signup/
    logout/
  components/
    ui/               # shadcn/ui components
    data-grid.tsx      # shared AG Grid wrapper
    nav-bar.tsx
  lib/
    supabase/         # client.ts (browser), server.ts (server), middleware.ts
supabase/
  migrations/         # SQL schema, RLS policies, stored procedures, seed data
```
