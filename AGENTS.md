# AGENTS.md

This is the authoritative development-governance document for the Ashburton Baptist Church website. Cursor and other AI agents must follow it for every request that changes the project.

The workflow is mandatory. Do not skip changelog, version, validation, or commit steps because the user did not mention them.

```
USER REQUEST
→ INSPECT
→ PLAN
→ IMPLEMENT
→ DATABASE MIGRATION IF REQUIRED
→ TEST
→ VALIDATE
→ UPDATE CHANGELOG.md
→ UPDATE CHANGELOG.json
→ UPDATE SEMANTIC VERSION
→ REVIEW GIT DIFF
→ GIT COMMIT
→ CI VALIDATION
```

Automated checks in `scripts/` and `.github/workflows/ci.yml` enforce this independently of these instructions. If those checks fail, the change is not complete.

---

## Project snapshot

Inspect the repository before changing anything. Do not assume frameworks that are not here.

| Area | This project |
| --- | --- |
| App | Vite 6 + React 18 + TypeScript SPA (`HashRouter` / Vercel rewrite) |
| Package manager | npm (`package.json` / `package-lock.json`) |
| Database | Supabase Postgres. Historical SQL lives as root `*.sql` files applied in the SQL Editor. **New** migrations go in `supabase/migrations/` |
| Backend | Supabase Edge Functions in `supabase/functions/` |
| Product changelog UI | Super Admin page reads curated entries from `CHANGELOG.json` via `lib/changelog.ts`, merged with GitHub commits |
| Tests | Node built-in test runner (`node --test`) for governance tooling. There is no application Jest/Vitest/Playwright suite yet |
| Lint | Not configured. Do not add ESLint in an unrelated task |
| Typecheck | `npm run typecheck` (`tsc --noEmit`). The existing app currently has TypeScript errors; do not fail a product change solely because of **pre-existing** errors you did not introduce |
| Build | `npm run build` (`vite build`) |
| Version | `package.json` `version` is the single authoritative SemVer. Keep it in lockstep with the latest `CHANGELOG.json` entry |
| Timezone | Changelog timestamps use `Pacific/Auckland`. App display timezones stay per-user via `lib/dateUtils.ts` |

If an equivalent mechanism already exists, extend it. Do not create a second changelog, version file, or migration system.

---

## 1. Inspect first

Before editing, inspect the relevant:

- Repository structure and existing code
- `CHANGELOG.json` / `CHANGELOG.md` (latest Change ID and version)
- `package.json` version
- Supabase SQL / `supabase/migrations/`
- Tests, scripts, and GitHub Actions
- Security-sensitive files (never commit secrets)

Do not assume the next Change ID or version. Run:

```bash
npm run changelog:next-id
```

That prints the next `CHG-YYYY-MMDD-NNN` and the actual Auckland date/time from the machine clock. Never invent timestamps.

---

## 2. Plan, then implement

State a short plan, then implement only what the request needs.

- Preserve existing behaviour unless the request is to change it
- Do not rewrite unrelated files
- Do not add dependencies unless they are necessary
- Match existing naming, layout, and TypeScript style

The changelog must describe **what was actually implemented**, not the original wish. If the user asked for a full notification system and you only added a table and API, record that.

If the work is incomplete, say so. Set `"partial": true` on the changelog entry and list known issues. Do not record a successful completion you did not achieve.

---

## 3. Database migrations

Use the existing Supabase SQL approach.

- **Do not edit** an already-applied production SQL file unless there is an explicit, safe, project-specific reason
- **New** schema or data migrations: create a new file

  `supabase/migrations/YYYYMMDDHHMMSS_descriptive_name.sql`

  Use a real UTC timestamp prefix. Names must be unique, descriptive, and committed
- Root `*.sql` files are historical. Leave them in place. New work should not add more ad-hoc SQL files at the repository root
- Create migrations with `supabase migration new <name>` when the Supabase CLI is available; otherwise use the filename pattern above
- Reference every new migration from the changelog `database.migrations` array
- If SQL is destructive (`DROP TABLE/COLUMN`, `TRUNCATE`, and similar), set `"database": { "migrations": ["..."], "destructive": true }` and never apply it silently to production
- Do not run destructive SQL against production from an agent session

---

## 4. Testing and validation

Every meaningful code change must be tested with the tools this repo actually has.

Run what applies:

```bash
npm test
npm run typecheck
npm run build
npm run validate
```

- Bug fixes should include a regression test when practical
- New behaviour should include automated tests when practical
- Never claim a test passed unless you ran it
- If you cannot run a check, record that in the changelog `validation` object and `validation.notes`

Governance tests live in `scripts/changelog/*.test.mjs` and use Node's built-in test runner.

---

## 5. Changelog (mandatory)

`CHANGELOG.md` and `CHANGELOG.json` are **mandatory** for every project-changing request.

Do not wait for the user to say "update the changelog".

Canonical file: **`CHANGELOG.json`**. Human file: **`CHANGELOG.md`**, generated from JSON.

After editing `CHANGELOG.json`:

```bash
npm run changelog:render
npm run validate:changelog
```

If Markdown and JSON drift, validation fails. Do not hand-edit Markdown into a different structure.

### Change IDs

Format: `CHG-YYYY-MMDD-NNN` (Auckland date, monotonic same-day sequence).

Examples: `CHG-2026-0916-001`, then `CHG-2026-0916-002`.

- Detect existing IDs via `npm run changelog:next-id`
- Do not reuse or invent IDs
- Historical product-changelog IDs such as `2026-09-16-changelog-date-filters` are preserved and must not be rewritten
- IDs must match between Markdown and JSON

### Required JSON fields

Each entry must include: `id`, `date`, `time`, `timezone`, `changedAt`, `version`, `type`, `title`, `request`, `changes`, `database`, `validation`, `breakingChange`.

Use `area` and `changedBy` so the Super Admin changelog UI stays accurate.

Allowed `type` values: `added`, `changed`, `fixed`, `removed`, `security`, `performance`, `refactored`, `documentation`, `infrastructure`.

Newest entries first. Never delete historical entries. Never rewrite historical entries unless explicitly correcting them.

---

## 6. Semantic versioning

Single source: **`package.json` `version`**.

`MAJOR.MINOR.PATCH`

| Bump | When |
| --- | --- |
| MAJOR | Breaking change (`breakingChange: true`) |
| MINOR | Backward-compatible new functionality |
| PATCH | Backward-compatible fix or internal improvement |

Do not bump the version just because files were edited. Do not bump when there is no user-visible or system-behaviour change beyond docs that you classified as `documentation` with no behaviour change — documentation-only work is still changelogged, usually as a PATCH if `package.json` must move with the latest entry. The latest changelog entry version **must** equal `package.json`.

Update `package-lock.json` root `version` to match when you bump `package.json`.

---

## 7. Git diff, safety, and commit

Before committing:

```bash
git status
git diff
```

- Do not overwrite unrelated user work
- Do not use `git reset --hard` or `git clean -fd` unless the user explicitly authorises it
- Do not commit `.env`, API keys, tokens, passwords, or credentials
- Stage only files related to the current Change ID

Commit convention:

```
<type>(<scope>): <description> [CHG-ID]
```

Types: `feat`, `fix`, `docs`, `refactor`, `perf`, `security`, `chore`, `test`, `infra`.

Examples:

```
feat(notifications): add customer notification system [CHG-2026-0916-001]
fix(auth): prevent duplicate password reset tokens [CHG-2026-0916-002]
refactor(api): simplify customer service architecture [CHG-2026-0916-003]
```

Create the commit when the change is complete unless the user forbade committing. Report the Change ID and the actual commit hash. Do not claim a commit exists unless `git log` shows it.

---

## 8. Security

- Never commit secrets. `.env` is gitignored. Use `.env.example` for names only
- Never expose the Supabase `service_role` key in client code
- Do not use `user_metadata` for authorization decisions; use `app_metadata` / server-side role fields
- Keep RLS in mind for any new table in `public`
- Destructive database work needs an explicit changelog flag and human confirmation for production

---

## 9. CI

GitHub Actions workflow: `.github/workflows/ci.yml`.

It runs on pull requests and pushes to `main`:

1. `npm ci`
2. `npm run validate` (changelog, version, migrations, changelog required on code changes)
3. `npm test`
4. `npm run build`

If validation fails, CI fails. Do not add extra workflows unless a new pipeline is actually required.

---

## 10. Final report

When the task is done, report:

- Change ID
- Version
- What actually changed
- Migrations (or none)
- Commands you ran and their real results
- Commit hash
- Known issues / partial work

---

## Commands

| Command | Purpose |
| --- | --- |
| `npm run changelog:next-id` | Next Change ID + Auckland timestamp |
| `npm run changelog:render` | Write `CHANGELOG.md` from `CHANGELOG.json` |
| `npm run validate:changelog` | Validate changelog files and Markdown/JSON sync |
| `npm run validate:version` | `package.json` matches latest changelog version |
| `npm run validate:migrations` | Changelog migration refs exist; new filenames are valid |
| `npm run validate` | All of the above plus changelog-required-on-code-change |
| `npm test` | Governance unit tests |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | Production Vite build |
