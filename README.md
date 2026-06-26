# Webapp

Next.js (App Router) + Supabase app with authentication, user management,
generic admin CRUD ("Table Edit"), many-to-many relationship management,
custom stored-procedure calls, AG Grid tables, Recharts, and test stubs.

Live deployment: https://webapp-delta-gray.vercel.app
Repo: https://github.com/KH-0206/VSL

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres + Auth) via `@supabase/ssr` / `@supabase/supabase-js`
- shadcn/ui (Base UI under the hood) — Button, Dialog, Select, DropdownMenu, etc.
- AG Grid Community — data tables
- Recharts — charts
- Vitest + Testing Library — tests
- Deployed on Vercel

## Getting started (local dev)

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project (free tier is fine).
2. In the project dashboard, go to **Project Settings → API** and copy:
   - Project URL
   - `anon` public key

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

These are gitignored (`.env*`) and never committed.

### 3. Run the database migrations

All schema changes live as numbered SQL files in `supabase/migrations/`, applied in order. Current migrations:

| File | What it does |
|---|---|
| `0001_profiles.sql` | `profiles` table linked to `auth.users`, role-based RLS, auto-creates a profile row on signup |
| `0002_orders.sql` | Example `orders` table + seed data, used by the Reports page |
| `0003_report_by_category.sql` | Example Postgres function (stored procedure), called via `supabase.rpc(...)` |
| `0004_project_policies.sql` | RLS policies for the `Project` table (created manually in the dashboard) |
| `0005_case_insensitive_text.sql` | Converts key text columns to `citext` (case-insensitive comparisons/sorting/uniqueness) |
| `0006_rename_project_table.sql` | Renames `Project` → `project` |
| `0007_person.sql`, `0009_person.sql` | `person` table (contact details) + seed data |
| `0008_ids_to_int.sql` | Switches identity columns from `bigint` to `int` (except `profiles.id`, which stays `uuid`) |
| `0010_skill.sql` | `skill` table + seed data |
| `0011_person_skill_link.sql` | Junction table linking `person` ↔ `skill` (many-to-many), with FKs and a unique constraint |
| `0012_person_skill_link_restrict.sql` | Switches those FKs from `cascade` to `restrict` — deleting a person/skill with active assignments is blocked |

Run them via the Supabase CLI:

```bash
npx supabase login          # needs SUPABASE_ACCESS_TOKEN or browser auth
npx supabase link --project-ref your-project-ref
npx supabase db push
```

Or paste each file's contents into the Supabase SQL Editor, in order.

### 4. Install dependencies and run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`, sign up for an account, and you'll land on `/dashboard`.

On Windows, two helper scripts live in `run/`:
- `run/start-dev.cmd` — plain `npm run dev`
- `run/restart-dev.cmd` — kills any stale dev server (reads the PID from `.next/dev/lock`, also clears ports 3000–3005), wipes the `.next` cache, then starts fresh. Use this if the dev server hangs, panics, or you just renamed/moved the project folder.

### 5. Run tests

```bash
npm test
```

## Pages / features

| Route | What it does |
|---|---|
| `/` | Public landing page (Log in / Sign up) |
| `/login`, `/signup`, `/logout` | Supabase Auth email/password flows |
| `/dashboard` | Signed-in landing page |
| `/users` | AG Grid list of `profiles` |
| `/projects` | Full CRUD (AG Grid + dialogs) on the `project` table |
| `/person-skills` | Manage the `person` ↔ `skill` many-to-many relationship: ActionBar with an **Add** button (two-step dialog: pick a person, then a skill, filtered to skills not already assigned), inline **Delete** per row |
| `/reports` | AG Grid + Recharts bar chart driven by the `report_totals_by_category` stored procedure, with CSV export |
| `/table-edit` | Lists tables configured in `src/config/table-edit.ts` (`table_edit_ref`) |
| `/table-edit/[table]` | Generic CRUD grid for any listed table — columns inferred from the data, create/edit/delete, restricted server-side to tables in `table_edit_ref` |

All `/dashboard`, `/users`, `/projects`, `/person-skills`, `/reports`, `/table-edit` routes are protected by session middleware (`src/proxy.ts` + `src/lib/supabase/middleware.ts`) — signed-out users are redirected to `/login`.

## Key patterns

### Adding a table to Table Edit

1. Write a migration creating the table with RLS policies (see `0010_skill.sql` for the template: enable RLS, then `select`/`insert`/`update`/`delete` policies for `authenticated`).
2. Add the table name to `table_edit_ref` in [`src/config/table-edit.ts`](src/config/table-edit.ts).

That's it — `/table-edit/<table>` automatically gets a working CRUD grid with columns inferred from the data.

### The Edit menu / extra panels pattern

Every row in a Table Edit grid has an **Edit** dropdown (built from [`EntityActionsMenu`](src/components/entity-actions-menu.tsx)), which always includes a generic **Details** panel (the inferred-column edit form). Tables can register additional panels — e.g. the `person` table has **Skills** (manage that person's skill assignments inline) and **Availability** (placeholder).

To add a custom panel for another table:

1. Write a self-contained panel component under `src/components/panels/` (it manages its own data fetching/actions — see [`PersonSkillsPanel`](src/components/panels/person-skills-panel.tsx) for the pattern).
2. Add an entry to `extraPanelBuilders` in [`src/config/entity-panels.tsx`](src/config/entity-panels.tsx) mapping the table name to a list of `{ key, label, render }` panels.

No changes needed to `EntityActionsMenu` or the Table Edit grid itself.

### ActionBar

[`ActionBar`](src/components/action-bar.tsx) is a generic `title` + action-buttons row, used at the top of `/person-skills`. Reuse it on any future page that needs a consistent toolbar.

### Calling your own stored procedures

1. Add a new Postgres function in a migration file under `supabase/migrations/`, following the pattern in `0003_report_by_category.sql`.
2. Call it from a Server Component or Server Action:

```ts
const { data, error } = await supabase.rpc("your_function_name", { param1: value });
```

### Case-insensitive text

Key text columns (`project.project_name`, `orders.customer_name`/`category`, `profiles.full_name`/`role`) use Postgres `citext` instead of `text` — equality, sorting, and uniqueness all ignore case automatically. Use `citext` for any new text column where that matters; there's no length-limited variant (use a `check (char_length(...) <= n)` constraint instead if you need a cap).

### WhatsApp integration

Any row with a `whatsapp` or `phone` column gets a **WhatsApp** button in Table Edit (see `buildWhatsAppLink` in [`table-edit-grid.tsx`](src/app/\(app\)/table-edit/[table]/table-edit-grid.tsx)) that opens `wa.me/<number>` — a free click-to-chat link, no API/account needed. For automated/programmatic WhatsApp sending later, you'd need the Meta WhatsApp Business Platform (directly or via a provider like Twilio) called from a Server Action — this is a paid, per-conversation service.

## Deployment (Vercel)

The project is linked to Vercel (`vsl-v1/webapp`). To deploy a new version:

```bash
npx vercel deploy --prod --token=<your-vercel-token> --scope vsl-v1
```

Environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are set on Vercel under Production — manage them with:

```bash
npx vercel env ls --scope vsl-v1
npx vercel env add <NAME> production --scope vsl-v1
```

**Auto-deploy on push** isn't wired up yet — it requires connecting a GitHub login to the Vercel account (Vercel → Account Settings → Login Connections), then re-linking the project. Until then, deploys are manual via the command above.

## Project structure

```
src/
  app/
    (app)/                  # authenticated routes (layout checks session via Supabase)
      dashboard/
      users/
      projects/             # project CRUD (dedicated page)
      person-skills/        # person <-> skill relationship management
      reports/
      table-edit/
        [table]/            # generic CRUD grid, restricted to table_edit_ref
    login/ signup/ logout/  # auth routes
  components/
    ui/                     # shadcn/ui primitives
    panels/                 # extra Edit-menu panels (e.g. person skills)
    data-grid.tsx           # shared AG Grid wrapper
    sidebar.tsx             # left nav, expands on hover
    action-bar.tsx          # generic toolbar (title + action buttons)
    entity-actions-menu.tsx # generic "Edit" dropdown -> panel dialog
  config/
    table-edit.ts           # table_edit_ref allowlist
    entity-panels.tsx       # per-table extra panel registry
  lib/
    supabase/               # client.ts (browser), server.ts (server), middleware.ts
  proxy.ts                  # Next.js 16 middleware entry point (session refresh + route guards)
supabase/
  migrations/               # SQL schema, RLS policies, stored procedures, seed data
run/
  start-dev.cmd             # plain `npm run dev`
  restart-dev.cmd           # kill stale server + clear .next cache + start fresh
```
