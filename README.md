# Next.js strict template

Production-minded starter for a Next.js App Router application with strict TypeScript, PostgreSQL,
Prisma, Zod, Tailwind CSS, automated tests, and reproducible quality gates.

The template favors executable checks over rule-count marketing: every documented local gate has a
matching npm script, CI runs the same commands, and warnings fail the strict lint job.

## What is included

- Next.js 16, React 19, React Compiler, typed routes, and Turbopack
- TypeScript 6 with `@tsconfig/strictest`
- Prisma 7 with the ESM-first generated client and PostgreSQL driver adapter
- PostgreSQL 17 Compose service and an initial committed migration
- Zod schemas for request and public response boundaries
- Tailwind CSS 4 with light and dark system themes
- oxlint, ESLint, oxfmt, Knip, CSpell, and Prisma-specific checks
- Node's test runner with TypeScript support and coverage thresholds
- Lefthook and lint-staged for local Git hooks
- GitHub Actions for quality gates, migrations, dependency review, CodeQL, and Scorecard
- Dependabot for npm and pinned GitHub Action updates

## Requirements

- Node.js 24 or newer
- npm 11 or newer
- Docker with Compose for the included local PostgreSQL service, or another PostgreSQL instance
- [Gitleaks](https://github.com/gitleaks/gitleaks#installing) before committing

## Quick start

```bash
cp .env.example .env
npm install
npm run db:up
npm run db:generate
npm run db:migrate:deploy
npm run db:seed
npm run dev
```

Open <http://localhost:3000>. The Compose credentials are intentionally local-only defaults; replace
them for any shared or deployed environment.

PostgreSQL binds only to `127.0.0.1:55432` to avoid common local port conflicts. Override the host
port with `POSTGRES_PORT` and update `DATABASE_URL` together when that port is unavailable.

Prisma Client is generated into `src/generated/prisma` and is intentionally ignored by Git. Run
`npm run db:generate` after a fresh install and after changing the schema.

## Daily commands

| Task                        | Command                               |
| --------------------------- | ------------------------------------- |
| Start development           | `npm run dev`                         |
| Run all fast local gates    | `npm run check`                       |
| Build for production        | `npm run build`                       |
| Run strict lint             | `npm run lint:ci`                     |
| Apply safe lint fixes       | `npm run lint:fix`                    |
| Check/apply formatting      | `npm run format` / `format:fix`       |
| Type-check                  | `npm run typecheck`                   |
| Test with coverage          | `npm run test:coverage`               |
| Find dead code/dependencies | `npm run knip`                        |
| Analyze Turbopack bundles   | `npm run analyze`                     |
| Start/stop PostgreSQL       | `npm run db:up` / `db:down`           |
| Create a migration          | `npm run db:migrate -- --name <name>` |
| Apply committed migrations  | `npm run db:migrate:deploy`           |
| Compare database and schema | `npm run db:migrate:check`            |
| Validate migration status   | `npm run db:migrate:status`           |
| Seed data                   | `npm run db:seed`                     |
| Open Prisma Studio          | `npm run db:studio`                   |

`npm run db:reset` deletes the local Compose volume. It is intentionally explicit and destructive.

## Architecture and safety defaults

Server-only modules import `server-only`. Application code imports the generated Prisma client only
through `src/lib/db.ts`; requests select an explicit public field set before Zod validates the
response. Server environment variables are parsed once and invalid configuration fails early.

The sample API demonstrates:

- exact `application/json` content type handling;
- strict request objects with normalized email addresses;
- deterministic 400, 409, 415, 422, and 500 responses;
- no-store responses and generic internal error messages;
- Prisma known-error narrowing instead of stringly typed duck checks.

The home page is forced dynamic because it reads live database state. This prevents a failed or stale
database query from being baked into the production build. `/api/health` is a process liveness check;
it intentionally does not claim database readiness.

Baseline response headers disable MIME sniffing and framing, restrict powerful browser features, and
set a conservative referrer policy. Deployments should add an environment-specific Content Security
Policy and HSTS at the trusted edge, where HTTPS and nonce handling are known.

## Database workflow

`prisma/schema.prisma` is the model source of truth; `prisma/migrations` is the deployment history.
For schema changes:

```bash
npm run db:migrate -- --name describe_the_change
npm run db:generate
npm run check
```

CI starts a real PostgreSQL service, applies every committed migration, and compares the resulting
database with the Prisma schema. Drift or a missing migration fails the workflow. `db:push` remains
available for disposable prototyping, but it must not replace committed migrations.

## CI and dependency security

The required CI gate checks formatting, both linters with zero warnings, TypeScript, tests and
coverage, dead code, Prisma validation, a production build, and dependency advisories.
Separate workflows cover real migration application, CodeQL, dependency review, and OpenSSF
Scorecard. Actions are pinned to full commit SHAs; Dependabot keeps those pins and npm dependencies
current.

`package.json` contains narrow overrides for patched transitive PostCSS and Hono server releases.
Keep them until the owning packages update their constraints, then remove them instead of letting
security overrides accumulate indefinitely.

Knip ignores `@prisma/client`, `pg`, and `@types/pg` because those runtime/type relationships live in
the ignored generated client and the Prisma adapter. They are required, not speculative packages.

The local pre-commit hook blocks commits when Gitleaks is missing or detects a secret. It no longer
converts a leak into a successful “skipped” result.

## Before using this in production

The `/api/users` route is intentionally an unauthenticated demonstration. Add your product's
authentication, authorization, durable rate limiting, audit logging, and abuse controls before
exposing a write endpoint. Do not implement in-memory rate limiting for a multi-instance deployment.

Also replace the project metadata and demo UI, choose a license, configure private vulnerability
reporting, set production database pool limits, add environment-specific observability, and make the
`All gates passed` job a required branch-protection check.

See [AGENTS.md](./AGENTS.md) for coding rules and [SECURITY.md](./SECURITY.md) for vulnerability
reporting guidance.
