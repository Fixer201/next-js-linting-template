# Next.js Max-Strictness Template

Opinionated Next.js + TypeScript + Prisma + PostgreSQL + Tailwind starter with the strictest code quality toolchain available. 1,283 lint rules across two linters, 5 security plugins, 5 CI workflows.

> Benchmarked against goldbergyoni/nodebestpractices, Dynatrace dt-app-templates, microsoft/TypeScript, vercel/ai, vercel/turborepo, mozilla/pdf.js, and shadcn-ui. This template matches or exceeds every one of them on security and code quality dimensions.

## Stack

| Layer      | Technology                                    | Version       |
| ---------- | --------------------------------------------- | ------------- |
| Framework  | Next.js (App Router, RSC, Turbopack)          | 16.2          |
| UI         | React + React DOM                             | 19.2          |
| Language   | TypeScript (`@tsconfig/strictest`)            | 6.0           |
| Database   | PostgreSQL                                    | 15+           |
| ORM        | Prisma (migrations, client, schema-first)     | 6.19          |
| Validation | Zod                                           | 4.4           |
| Styling    | Tailwind CSS (v4, CSS-first config)           | 4.3           |
| Compiler   | React Compiler (Babel, auto-memo)             | 1.0           |
| Linter 1   | oxlint (Rust, 254 rules, 8 plugins)           | 1.71          |
| Linter 2   | ESLint (flat config, 1,029 rules, type-aware) | 10.6          |
| Formatter  | oxfmt (Rust, Prettier-compatible)             | 0.57          |
| Dead code  | Knip (built-in Next.js plugin)                | 6.23          |
| Git hooks  | Lefthook + lint-staged                        | 2.1 / 17.0    |
| Secrets    | Gitleaks (pre-commit) + no-secrets (IDE)      | 8.x / 2.3     |
| Bundle     | @next/bundle-analyzer                         | 16.2          |
| CI/CD      | GitHub Actions (5 workflows, pinned SHAs)     | —             |
| SAST       | CodeQL (data-flow analysis)                   | GitHub-native |
| Audit      | OpenSSF Scorecard (18 health checks)          | weekly        |

## Linting & Security

### oxlint — primary, 254 rules, 8 plugins

Fast Rust linter covering correctness, performance, and conventions. Runs in **~35ms**.

| Plugin       | Rules                  | Source                            |
| ------------ | ---------------------- | --------------------------------- |
| `eslint`     | 61 (error)             | ESLint core rules                 |
| `nextjs`     | 21                     | @next/eslint-plugin-next          |
| `react`      | 43 (error) + 20 (warn) | eslint-plugin-react + react-hooks |
| `typescript` | — (categories only)    | @typescript-eslint                |
| `oxc`        | 17 (warn)              | OXC-specific checks               |
| `jsx-a11y`   | 36                     | eslint-plugin-jsx-a11y            |
| `import`     | 33                     | eslint-plugin-import              |
| `promise`    | 15 (warn) + 1 (error)  | eslint-plugin-promise             |

### ESLint — secondary, 1,029 rules (resolved flat config)

Type-aware gap-fill linter. Runs in **~1s** with `--concurrency=auto`.

**5 security plugins** (#1 recommendation from nodebestpractices):

| Plugin                         | Rules | Catches                                                      |
| ------------------------------ | ----- | ------------------------------------------------------------ |
| `eslint-plugin-security`       | 10    | `eval()`, path traversal, ReDoS, timing attacks, weak crypto |
| `eslint-plugin-no-unsanitized` | 6     | DOM XSS: `innerHTML`, `document.write`, `location.href`      |
| `eslint-plugin-no-secrets`     | 1     | Entropy-based secret detection (API keys, tokens)            |
| `eslint-plugin-sonarjs`        | ~70   | Cognitive complexity, duplicate strings, bug patterns        |
| `@microsoft/eslint-plugin-sdl` | 7     | `no-inner-html`, `no-document-write`, `no-insecure-random`   |

**Next.js-specific:**

| Plugin                         | What it enforces                                                         |
| ------------------------------ | ------------------------------------------------------------------------ |
| `@next/eslint-plugin-next`     | no-img-element, no-html-link, no-sync-scripts, no-async-client-component |
| `eslint-plugin-react-rsc`      | RSC boundary violations, `'use client'`/`'use server'` directives        |
| `eslint-plugin-react-compiler` | React Compiler rules (referential stability)                             |
| `eslint-plugin-import-access`  | Server-only module isolation (client → server imports blocked)           |

**Code quality:**

| Plugin                        | Rules        | Focus                                                       |
| ----------------------------- | ------------ | ----------------------------------------------------------- |
| `@eslint-react/eslint-plugin` | 65           | Modern React (JSX, hooks, DOM, naming)                      |
| `eslint-plugin-unicorn`       | 100+         | Power rules (prefer-_, no-_, consistency)                   |
| `eslint-plugin-perfectionist` | 8 categories | Auto-sort imports, exports, JSX props, objects, union types |
| `@cspell/eslint-plugin`       | 1            | Spellcheck identifiers, JSX text, comments                  |
| `eslint-plugin-tailwindcss`   | 6            | Class order, contradicting classes, shorthand enforcement   |
| `eslint-plugin-promise`       | 5            | Promise patterns (no-nesting, avoid-new, valid-params)      |
| `@v2nic/eslint-plugin-prisma` | 2            | no-unsafe, no-snake-case-in-ts                              |

### AST-level protections

- `no-restricted-syntax` — blocks `Function()`, `new Function()`, `globalThis.Function()` at syntax-tree level
- `preserve-caught-error` — blocks `catch {}` without error variable (ESLint v10)

### TypeScript — `@tsconfig/strictest`

```jsonc
{
  "strict": true,
  "noUncheckedIndexedAccess": true, // arr[0] → T | undefined
  "exactOptionalPropertyTypes": true, // missing ≠ undefined
  "noImplicitOverride": true, // override keyword required
  "noImplicitReturns": true, // all code paths return
  "noPropertyAccessFromIndexSignature": true, // obj['key'] for index types
  "erasableSyntaxOnly": true, // no enum, namespace
  "verbatimModuleSyntax": true, // import type explicit
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true,
}
```

65 type-aware ESLint rules: `no-floating-promises: error`, `strict-boolean-expressions: warn`, `switch-exhaustiveness-check: error`, `no-explicit-any: error`, `no-unsafe-*: warn`, and 55 more.

### Secret detection — two independent layers

| Layer      | Tool                       | When                                                    |
| ---------- | -------------------------- | ------------------------------------------------------- |
| Editor     | `eslint-plugin-no-secrets` | While typing — entropy-based                            |
| Pre-commit | Gitleaks                   | 80+ regex patterns (AWS, GitHub, Stripe, Prisma tokens) |

## Git Hooks

### Pre-commit (parallel, ~4s)

| Check      | Tool                                      |
| ---------- | ----------------------------------------- |
| Secrets    | Gitleaks                                  |
| Format     | oxfmt --write (staged files)              |
| Lint + fix | oxlint --fix → eslint --fix (lint-staged) |

### Pre-push (parallel, ~16s)

| Check            | Tool            | Time  |
| ---------------- | --------------- | ----- |
| Dead code        | Knip            | ~1.5s |
| Type check       | tsc --noEmit    | ~2.5s |
| Schema valid     | prisma validate | ~2s   |
| Production build | next build      | ~10s  |

### Post-merge / Post-checkout

Auto `npm install` if `package-lock.json` changed.

## CI/CD — 5 GitHub Actions workflows

### CI (every push, PR, merge_group)

```
npm ci → oxfmt --check → lint:ci → tsc → knip → prisma validate → build
```

4 parallel jobs + aggregate `required` gate. Pinned action SHAs. `contents: read`.

### Prisma Check (prisma/ changes, weekly)

Schema validation + client generation + migration drift detection.

### CodeQL (push to main, weekly)

Semantic SAST — `security-extended,security-and-quality` queries. Data-flow analysis for SQL injection, XSS, SSRF.

### Dependency Review (every PR)

Blocks CRITICAL CVEs. License policy: allow MIT/Apache/BSD/ISC, deny GPL/AGPL/LGPL/MPL.

### OpenSSF Scorecard (weekly, push to main)

18 security health checks → SARIF report in Security tab.

## Server-Only Isolation

| Mechanism                   | Effect                                                            |
| --------------------------- | ----------------------------------------------------------------- |
| `server-only` package       | Crashes at runtime if imported in client bundle                   |
| `import-access` ESLint rule | Blocks client code from importing `db.ts`, Prisma, server modules |
| `.env.example` committed    | Template for `DATABASE_URL`; `.env` is gitignored                 |

## File Structure

```
src/
  app/
    layout.tsx              Root layout (metadata, Geist fonts)
    page.tsx                Demo: server component, Prisma read + Zod
    globals.css             @import 'tailwindcss'; @theme inline { … }
    api/users/route.ts      POST/GET /api/users (parse at boundary)
  lib/
    utils.ts                cn() — clsx + tailwind-merge + CVA
    db.ts                   Prisma singleton (imports server-only)
    validations/user.ts     Zod schemas (createUser, user, userList)
prisma/
  schema.prisma             User model + datasource (PostgreSQL)
  seed.ts                   Demo data (Alice, Bob)
.oxlintrc.json              254 rules, 8 plugins, ignores, overrides
eslint.config.mjs           1,029 resolved rules, 5 security plugins
lefthook.yml                3 pre-commit + 4 pre-push gates
knip.json                   Strict dead code (entry: utils.ts, db.ts)
.github/workflows/          5 CI workflows with pinned SHAs
```

9 runtime deps, 47 dev deps. 8 source files.

## Quick Start

```bash
git clone <this-repo> my-project && cd my-project
npm install --legacy-peer-deps

# Database setup
cp .env.example .env                  # set DATABASE_URL
npm run db:generate && npm run db:migrate && npm run db:seed

# Dev
npm run dev                            # http://localhost:3000

# All quality checks
npm run lint:ci && npm run typecheck && npm run knip && npm run format

# Production build
npm run build
```

## Commands

```bash
# Dev & Build
npm run dev | start | build | preview

# Lint & Format
npm run lint          # oxlint + eslint (dual-pass)
npm run lint:fix      # Auto-fix all
npm run lint:ci       # Strict (warnings = errors)
npm run format        # Check
npm run format:fix    # Apply

# Quality
npm run typecheck     # tsc --noEmit
npm run knip          # Dead code
npm run knip:fix      # Auto-remove

# Prisma
npm run db:generate | db:push | db:migrate | db:seed | db:studio | db:validate
```

## Quality Gates

All must pass before merge:

```
✓ oxfmt --check             0 formatting changes
✓ oxlint                     0 errors, 0 warnings (254 rules)
✓ eslint                     0 errors, 0 warnings (1,029 rules)
✓ tsc --noEmit               0 type errors
✓ knip                       0 dead code
✓ prisma validate            schema valid
✓ npm run build              production build succeeds
```

CI adds: Dependency Review (no CRITICAL CVEs), CodeQL SAST (no semantic vulns), Scorecard (security health audit).

## How It Compares

| Dimension                 | This template | next.js  | microsoft/TS | vercel/ai | Dynatrace | pdf.js |
| ------------------------- | :-----------: | :------: | :----------: | :-------: | :-------: | :----: |
| oxlint + ESLint dual-pass |      ✅       |    ❌    |      ❌      |    ✅     |    ❌     |   ❌   |
| Security plugins          |     **5**     |    0     |      0       |     0     |     5     |   0    |
| CodeQL                    |      ✅       |    ❌    |      ✅      |    ❌     |    ❌     |   ✅   |
| Scorecard                 |      ✅       |    ❌    |      ✅      |    ❌     |    ❌     |   ❌   |
| Dependency Review         |      ✅       |    ❌    |      ❌      |    ❌     |    ❌     |   ❌   |
| Prisma validate CI        |      ✅       |   N/A    |     N/A      |    N/A    |    N/A    |  N/A   |
| Knip (dead code)          |      ✅       |  custom  |      ✅      |    ❌     |    ❌     |   ❌   |
| RSC rules                 |      ✅       | internal |     N/A      |  oxlint   |    ❌     |  N/A   |
| React Compiler lint       |      ✅       |    ❌    |     N/A      |    ❌     |    ❌     |  N/A   |
| server-only guard         |      ✅       |    ❌    |     N/A      |    ❌     |    ❌     |  N/A   |
| AST-level protections     |      ✅       | ast-grep |      ❌      |    ❌     |  partial  |   ❌   |
| Gitleaks pre-commit       |      ✅       |    ❌    |      ❌      |    ❌     |    ❌     |   ❌   |
| aggregate CI gate         |      ✅       |    ❌    |      ✅      |    ❌     |    ❌     |   ❌   |

Full comparison including nodebestpractices, shadcn-ui, turborepo, and prisma-examples in [COMPARISON.md](./COMPARISON.md).

## AI Agent Support

`AGENTS.md` with 17 sections: toolchain, workflow, quality gates, TypeScript rules, Next.js rules, security rules, Prisma rules, imports, styling, validation, naming, file structure, patterns, anti-patterns, troubleshooting, CI, and checklist. Compatible with Claude Code, Cursor, Codex, Copilot, and OpenCode.

---

**If a tool can catch it, a human shouldn't have to.**
