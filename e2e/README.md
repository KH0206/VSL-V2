# E2E Tests (Playwright)

## One-time setup

1. Install Playwright browsers:
   npx playwright install chromium
2. Create credentials for auth tests as environment variables:
   - E2E_EMAIL
   - E2E_PASSWORD

PowerShell example:

$env:E2E_EMAIL="you@example.com"
$env:E2E_PASSWORD="your-password"

## Run tests

- Headless:
  npm run test:e2e
- Interactive UI mode:
  npm run test:e2e:ui

## First run for screenshot tests

If a screenshot test fails with "A snapshot doesn't exist", generate the baseline images:

- npm run test:e2e:update-snapshots

Then run normal checks again:

- npm run test:e2e

## Purpose

The `dashboard-overview.spec.ts` test verifies:
- Login flow
- Navigation to `/dashboard-overview`
- Presence of key UI elements
- Full-page screenshot for design review

The `navigation-and-actionbar.spec.ts` test verifies:
- Sidebar route navigation smoke across key pages
- ActionBar controls (Select / Do / New)
- Do menu options visibility

The `project-allocation-table-edit.spec.ts` test verifies:
- `/table-edit/project_allocation` loads for authenticated users
- CRUD controls are present
- Row-level Edit/Delete icon controls appear when data exists
