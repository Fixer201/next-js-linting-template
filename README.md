# Next.js Max-Strictness Template

Opinionated Next.js + TypeScript + Prisma + Tailwind starter with a strict code quality toolchain.

> Built to match or exceed the security and code quality standards of goldbergyoni/nodebestpractices (105K★), Dynatrace dt-app-templates, and microsoft/TypeScript.

## Stack

| Layer                | Technology                                              | Version                            |
| -------------------- | ------------------------------------------------------- | ---------------------------------- |
| **Runtime**          | Next.js + React + React DOM                             | 16.x / 19.x / 19.x                 |
| **Language**         | TypeScript                                              | 6.x (strictest mode)               |
| **Styling**          | Tailwind CSS v4                                         | 4.x (CSS-first config)             |
| **Compiler**         | React Compiler (Babel)                                  | 1.x (auto-memoization)             |
| **Database**         | PostgreSQL                                              | 15+                                |
| **ORM**              | Prisma                                                  | 6.x (schema-first, migrations)     |
| **Validation**       | Zod v4                                                  | 4.x (schema → type inference)      |
| **Linter**           | oxlint + ESLint                                         | 1.71 + 10.x (dual-pass)            |
| **Formatter**        | oxfmt                                                   | latest (Rust, Prettier-compatible) |
| **Dead code**        | Knip                                                    | 6.x (built-in Next.js plugin)      |
| **Git hooks**        | Lefthook + lint-staged                                  | 2.x + 17.x                         |
| **Secrets**          | Gitleaks + eslint-plugin-no-secrets                     | 8.x (two layers)                   |
| **Security linting** | eslint-plugin-security + no-unsanitized + sonarjs       | 10 + 6 + 70 rules                  |
| **Next.js linting**  | @next/eslint-plugin-next + eslint-plugin-react-rsc      | 30+ modern rules                   |
| **React linting**    | @eslint-react/eslint-plugin + eslint-plugin-react-hooks | 65 modern rules                    |
| **React Compiler**   | eslint-plugin-react-compiler                            | Compiler rule enforcement          |
| **Code quality**     | eslint-plugin-unicorn + eslint-plugin-jsx-a11y          | 70+ + 38 rules                     |
| **Import sort**      | eslint-plugin-perfectionist                             | 5.x (8 sort categories)            |
| **Spell check**      | CSpell (ESLint plugin)                                  | 10.x                               |
| **Server isolation** | server-only + eslint-plugin-import-access               | Boundary enforcement               |
| **Prisma linting**   | @v2nic/eslint-plugin-prisma                             | ORM best practices                 |
| **Bundle analysis**  | @next/bundle-analyzer                                   | Dev-only bundle inspector          |
| **CI/CD**            | GitHub Actions (5 workflows)                            | —                                  |
| **SAST**             | CodeQL (semantic analysis)                              | GitHub-native                      |
| **Security audit**   | OpenSSF Scorecard                                       | 18 checks, weekly                  |

## Why This Exists

Most Next.js templates ship with bare-minimum linting. This one takes the opposite approach — it applies the strictest rules available, inspired by how Vercel, Shopify, Airbnb, and Mozilla configure their toolchains.

After researching the top 20+ security and code quality repositories on GitHub, this template combines the best practices from all of them into a single, coherent toolchain — now adapted for Next.js App Router with Prisma.

## What's Inside

### Code Quality & Security (500+ rules, <200ms)

| Tool           | What It Does                                                                                                                                | Speed   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| **oxlint**     | 388 native Rust lint rules across 8 plugins (Next.js, React, TypeScript, JSX a11y, imports, Unicorn, Promise, OXC)                          | ~30ms   |
| **ESLint**     | Type-aware TypeScript rules (65 rules), 4 security plugins (87 rules), React (65 rules), Next.js, RSC, React Compiler, Tailwind, spellcheck | ~1s     |
| **oxfmt**      | Rust formatter — Prettier-compatible, 30× faster                                                                                            | ~180ms  |
| **Knip**       | Dead code scanner — finds unused files, exports, and npm dependencies (built-in Next.js plugin)                                             | ~500ms  |
| **Gitleaks**   | Secret scanner — blocks commits containing API keys, tokens, or passwords                                                                   | instant |
| **no-secrets** | Entropy-based secret detection in editor — catches secrets before `git add`                                                                 | instant |

### Security Linting (4 dedicated plugins)

Following the #1 recommendation from [goldbergyoni/nodebestpractices](https://github.com/goldbergyoni/nodebestpractices) (105K★):

| Plugin                           | Rules | Catches                                                                                 |
| -------------------------------- | ----- | --------------------------------------------------------------------------------------- |
| **eslint-plugin-security**       | 10    | `eval()`, `child_process` injection, path traversal, ReDoS, timing attacks, weak crypto |
| **eslint-plugin-no-unsanitized** | 6     | DOM XSS: `innerHTML`, `document.write`, `location.href`, `setAttribute` sinks           |
| **eslint-plugin-no-secrets**     | 1     | High-entropy strings matching API key/token patterns — caught in editor                 |
| **eslint-plugin-sonarjs**        | ~70   | Code quality smells: cognitive complexity, duplicate strings, bug patterns              |

Plus AST-level protections:

- `no-restricted-syntax` — blocks `Function()`, `new Function()`, `globalThis.Function()` at the syntax-tree level
- `preserve-caught-error` — blocks `catch {}` without error variable (ESLint v10)

### Next.js-Specific Rules

| Plugin                         | What it catches                                                            |
| ------------------------------ | -------------------------------------------------------------------------- |
| `@next/eslint-plugin-next`     | no-img-element, no-html-link, no-sync-scripts, no-async-client-component   |
| `eslint-plugin-react-rsc`      | RSC boundary violations, server-only imports in client, missing directives |
| `eslint-plugin-react-compiler` | React Compiler rule violations (referential stability, hooks rules)        |
| `eslint-plugin-import-access`  | Server-only module access control — prevents client imports of server code |

### TypeScript Strictness

Extends `@tsconfig/strictest` — the most aggressive TS config in the community:

| Flag                                 | Catches                                                |
| ------------------------------------ | ------------------------------------------------------ |
| `strict: true`                       | Null access, implicit any, loose function types        |
| `noUncheckedIndexedAccess`           | `arr[0]` returns `T \| undefined` — forces null checks |
| `exactOptionalPropertyTypes`         | Distinguishes "missing" from "explicitly undefined"    |
| `noImplicitOverride`                 | Requires `override` keyword on class method overrides  |
| `noImplicitReturns`                  | All code paths must explicitly return                  |
| `noPropertyAccessFromIndexSignature` | Forbids `obj.key` when key is from index type          |
| `erasableSyntaxOnly`                 | No `enum`, `namespace`, parameter properties           |
| `verbatimModuleSyntax`               | Explicit `import type` for type-only imports           |

Plus 65 type-aware ESLint rules:

- `no-floating-promises: error` — unhandled Promise rejection
- `strict-boolean-expressions: warn` — implicit boolean coercion
- `switch-exhaustiveness-check: error` — missing switch cases
- `no-explicit-any: error` — no escape hatches

### Git Hooks (automatic, non-blocking speed)

| Hook              | Runs                                              | Time    |
| ----------------- | ------------------------------------------------- | ------- |
| **pre-commit**    | Gitleaks → oxfmt → oxlint + ESLint (parallel)     | <2s     |
| **pre-push**      | Knip → TypeScript → Prisma validate (parallel)    | <10s    |
| **post-merge**    | Auto `npm install` if `package-lock.json` changed | instant |
| **post-checkout** | Auto `npm install` if `package-lock.json` changed | instant |

### CI/CD (GitHub Actions)

| Workflow              | Trigger              | Gates                                                                            |
| --------------------- | -------------------- | -------------------------------------------------------------------------------- |
| **CI**                | Every push & PR      | lint:ci → typecheck → knip → prisma-validate → build (parallel + aggregate gate) |
| **Prisma Check**      | prisma/ changes      | Schema validation + migration drift detection                                    |
| **CodeQL**            | Push to main, weekly | Semantic SAST — data-flow graph, finds injection/XSS across function boundaries  |
| **Dependency Review** | Every PR             | Blocks merging if PR adds a package with a known CRITICAL CVE                    |
| **OpenSSF Scorecard** | Weekly, push to main | 18 security health checks → SARIF report in GitHub Security tab                  |

All workflows use **pinned action SHAs** and **least-privilege permissions** (`contents: read` by default).

### Server-Only Code Isolation

| Tool            | What It Does                                                                             |
| --------------- | ---------------------------------------------------------------------------------------- |
| `server-only`   | Package that crashes if imported in client bundle — guards `db.ts`, Prisma, server logic |
| `import-access` | ESLint rule preventing client components from importing server-only modules              |
| `.env.example`  | Template for `DATABASE_URL` — actual `.env` is gitignored                                |

### Runtime Safety

| Tool               | What It Does                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| **Zod v4**         | Schema validation with auto-inferred TypeScript types. Parse at boundaries, never trust `any`. |
| **React Compiler** | Automatic memoization — no more manual `useMemo`/`useCallback`.                                |
| **CVA**            | Type-safe component variants. `cn()` helper for conflict-free class merging.                   |

---

## Quick Start

```bash
# Clone and install
git clone <this-repo> my-project
cd my-project
npm install --legacy-peer-deps

# Configure database
cp .env.example .env
# Edit .env — set DATABASE_URL to your PostgreSQL instance

# Setup database
npm run db:generate   # generate Prisma client
npm run db:migrate     # create and apply migration
npm run db:seed       # seed demo data (optional)

# Start dev server
npm run dev

# Run all quality checks
npm run lint:ci && npm run typecheck && npm run knip && npm run db:validate && npm run format

# Build for production
npm run build
```

## Available Commands

```bash
npm run dev            # Start Next.js dev server
npm run build          # Prisma generate + Next.js production build
npm run start          # Start production server
npm run preview        # Preview production build

npm run lint           # oxlint + eslint (fast)
npm run lint:fix       # Auto-fix all lint issues
npm run lint:ci        # Strict CI mode (warnings = errors)
npm run lint:oxlint    # oxlint only
npm run lint:eslint    # ESLint only

npm run format         # Check formatting
npm run format:fix     # Auto-format all files

npm run typecheck      # TypeScript type check
npm run knip           # Find dead code
npm run knip:fix       # Auto-remove dead code
npm run knip:production # Production-mode dead code scan

# Prisma commands
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to DB (no migration)
npm run db:migrate    # Create + apply migration
npm run db:seed       # Seed demo data
npm run db:studio     # Open Prisma Studio GUI
npm run db:validate   # Validate schema.prisma
```

## Architecture

```
src/
  app/                     # Next.js App Router
    layout.tsx             # Root layout (metadata, fonts)
    page.tsx               # Home page (server component, Prisma read)
    globals.css            # Tailwind v4 + @theme tokens
    api/                   # API route handlers
      users/
        route.ts           # GET/POST /api/users (Zod + Prisma)
  lib/
    utils.ts               # cn() — clsx + tailwind-merge + CVA
    db.ts                  # Prisma client singleton (server-only)
    validations/           # Zod schemas (parse at boundary)
      user.ts
  components/              # Reusable UI components
  hooks/                   # Custom hooks
  types/                   # Shared TypeScript types
prisma/
  schema.prisma            # Prisma schema (User model example)
  migrations/              # Generated migrations
  seed.ts                  # Seed script
.github/
  workflows/
    ci.yml                 # Lint + typecheck + knip + prisma + build gates
    prisma.yml             # Schema validation + migration drift
    codeql.yml             # Semantic SAST (weekly)
    dependency-review.yml  # Block CVEs in PRs
    scorecard.yml          # OpenSSF Scorecard security audit
```

### Philosophy

- **No barrel files** — import directly from source. Barrel files hurt tree-shaking and build speed.
- **Parse at the boundary** — validate API responses, form data, and localStorage with Zod before they enter your app.
- **Never `any`** — use Zod schemas, proper types, or `unknown` with type guards.
- **No dynamic code execution** — `eval()`, `Function()`, `globalThis.Function()` blocked at AST level.
- **No swallowed errors** — `catch {}` without error variable blocked by `preserve-caught-error`.
- **Warnings = errors in CI** — `lint:ci` uses `--deny-warnings`.
- **Secrets in code = blocked** — Gitleaks (pre-commit) + no-secrets (IDE) — two independent layers.
- **Server-only isolation** — `db.ts` and server logic import `server-only` — crashes if imported in client bundle.

## Quality Gates

Before merging any PR, ALL of these must pass:

```
✓ oxfmt --check          (0 formatting changes)
✓ oxlint                  (0 errors)
✓ eslint                  (0 errors)
✓ tsc --noEmit            (0 type errors)
✓ knip                    (0 dead code)
✓ prisma validate         (schema valid)
✓ npm run build           (build succeeds)
```

CI also runs automatically on every push and PR:

```
✓ Dependency Review       (no CRITICAL CVEs in new deps)
✓ CodeQL SAST             (no semantic vulnerabilities)
✓ OpenSSF Scorecard       (security health audit)
```

## AI Agent Support

This template includes `AGENTS.md` with 17 sections covering the full development process — toolchain, workflow, security rules, Prisma rules, code standards, common patterns, and anti-patterns. Compatible with Claude Code, Cursor, Codex, Copilot, and OpenCode.

## Learn More

- [AGENTS.md](./AGENTS.md) — Development process guide for AI agents and developers
- [Next.js Docs](https://nextjs.org/docs) — App Router, RSC, Server Actions
- [Prisma Docs](https://www.prisma.io/docs) — Schema, migrations, client API
- [Oxlint Rules](https://oxc.rs/docs/guide/usage/linter/rules) — Full list of available rules
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs) — v4 uses CSS-first config
- [Zod v4 Docs](https://zod.dev) — Schema validation with type inference
- [nodebestpractices](https://github.com/goldbergyoni/nodebestpractices) — The Node.js security bible (105K★)
- [OpenSSF Scorecard](https://securityscorecards.dev) — Automated security health checks

---

**If a tool can catch it, a human shouldn't have to.**
