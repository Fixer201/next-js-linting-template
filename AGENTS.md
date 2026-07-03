# AGENTS.md — Development Process

> **Audience:** AI coding agents (Claude Code, Cursor, Codex, Copilot, OpenCode) and human developers.
> **Purpose:** One source of truth for code standards, toolchain, workflow, and quality gates. Read this before writing any code.

---

## 1. Environment & Toolchain

| Tool           | What                                                                     | Command                             |
| -------------- | ------------------------------------------------------------------------ | ----------------------------------- |
| **Node.js**    | Runtime                                                                  | v22+                                |
| **npm**        | Package manager                                                          | `npm install --legacy-peer-deps`    |
| **Next.js**    | Framework (App Router, RSC, Server Actions)                              | `npm run dev`                       |
| **TypeScript** | Type checker (strictest mode)                                            | `npm run typecheck`                 |
| **oxlint**     | Fast native linter (Rust, 388+ rules, nextjs plugin)                     | `npm run lint:oxlint`               |
| **ESLint**     | Gap-fill linter (type-aware, security, tailwind, cspell, unicorn, react) | `npm run lint:eslint`               |
| **oxfmt**      | Formatter (Rust, Prettier-compatible)                                    | `npm run format:fix`                |
| **Knip**       | Dead code detection (built-in Next.js plugin)                            | `npm run knip`                      |
| **Prisma**     | ORM + migrations + schema validation                                     | `npm run db:migrate`                |
| **Gitleaks**   | Secret scanner                                                           | `gitleaks protect --staged -v`      |
| **Zod v4**     | Runtime validation (parse at boundary)                                   | Import from `zod`                   |
| **CVA**        | Type-safe component variants                                             | Use `cn()` from `src/lib/utils.ts`  |
| **Lefthook**   | Git hooks (parallel)                                                     | Auto-installed via `prepare` script |

**Before starting work:**

```bash
npm install --legacy-peer-deps        # install dependencies
cp .env.example .env                  # configure DATABASE_URL
npm run db:generate                   # generate Prisma client
npm run db:migrate                    # create/sync database schema
npm run dev                            # start dev server (http://localhost:3000)
```

---

## 2. Development Workflow

### Making a Change — Step by Step

```
1. WRITE CODE
   ↓
2. SAVE → oxfmt auto-formats, oxlint shows errors in editor, no-secrets checks for credentials
   ↓
3. git add → npm run lint:fix (oxlint --fix + eslint --fix)
   ↓
4. git commit → Lefthook runs: gitleaks → oxfmt → lint-staged (parallel)
   ↓
5. git push → Lefthook runs: knip + tsc + prisma validate (parallel)
   ↓
6. CI (GitHub Actions) → lint:ci + typecheck + knip + prisma-validate + build (parallel), Scorecard + CodeQL (scheduled)
```

### Pre-commit checks (automatic, <2 seconds)

- **Gitleaks** — scans for API keys, tokens, passwords in staged files
- **oxfmt** — auto-formats staged `.ts/.tsx/.css/.json/.md/.prisma` files
- **lint-staged** — runs `oxlint --fix` + `eslint --fix` on staged `.ts/.tsx`

### Pre-push checks (automatic, <10 seconds)

- **Knip** — finds unused files, exports, dependencies
- **TypeScript** — `tsc --noEmit --skipLibCheck` type-checks the entire project
- **Prisma validate** — checks schema.prisma is valid

### CI checks (automatic, GitHub Actions)

- **Lint** — `oxlint --deny-warnings + eslint` (strict CI mode)
- **Type check** — `tsc --noEmit --skipLibCheck`
- **Dead code** — `knip` (0 errors)
- **Prisma validate** — schema validation + client generation
- **Build** — `prisma generate && next build`
- **Prisma Check** — schema validation + migration drift detection (on prisma/ changes)
- **Dependency Review** — blocks PRs adding packages with CRITICAL CVEs
- **CodeQL** — semantic SAST (weekly + on push to main)
- **OpenSSF Scorecard** — security health audit (weekly)

### Manual quality commands

```bash
npm run lint          # Full lint: oxlint + eslint
npm run lint:fix      # Auto-fix all lint issues
npm run lint:ci       # Strict CI mode (warnings = errors)
npm run format        # Check formatting (oxfmt --check)
npm run format:fix    # Apply formatting (oxfmt --write)
npm run typecheck     # TypeScript type check
npm run knip          # Find dead code
npm run knip:fix      # Auto-remove dead code
npm run build         # Full production build (prisma generate + next build)

# Prisma commands
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to DB (no migration)
npm run db:migrate    # Create + apply migration
npm run db:seed       # Seed demo data
npm run db:studio     # Open Prisma Studio GUI
npm run db:validate   # Validate schema.prisma
```

---

## 3. Quality Gates — Work is NOT Done Until ALL Pass

| Gate              | Command                           | Must Be   |
| ----------------- | --------------------------------- | --------- |
| **Format**        | `npx oxfmt --check`               | 0 changes |
| **Lint (oxlint)** | `npx oxlint`                      | 0 errors  |
| **Lint (ESLint)** | `npx eslint`                      | 0 errors  |
| **Type check**    | `npx tsc --noEmit --skipLibCheck` | 0 errors  |
| **Dead code**     | `npx knip`                        | 0 errors  |
| **Prisma**        | `npx prisma validate`             | Exit 0    |
| **Build**         | `npm run build`                   | Exit 0    |

**CI mode:** `npm run lint:ci` treats warnings as errors. Run this before pushing to CI.

---

## 4. TypeScript Rules

### Strictness (via `@tsconfig/strictest`)

The project extends `@tsconfig/strictest` — the most aggressive TS config in the community. Every flag beyond `strict: true` is enabled:

| Flag                                 | Effect                                  | Example                                 |
| ------------------------------------ | --------------------------------------- | --------------------------------------- |
| `noUncheckedIndexedAccess`           | `obj[key]` returns `T \| undefined`     | Must check: `if (arr[0]) { ... }`       |
| `exactOptionalPropertyTypes`         | `{ x?: string }` forbids `x: undefined` | Pass the value or omit the key entirely |
| `noImplicitOverride`                 | Requires `override` keyword             | `override render() { ... }`             |
| `noImplicitReturns`                  | All code paths must return              | No implicit `undefined` return          |
| `noPropertyAccessFromIndexSignature` | Use `obj['key']` for index types        | Not `obj.key` unless key is known       |
| `verbatimModuleSyntax`               | Explicit `import type`                  | `import type { Props }`                 |
| `erasableSyntaxOnly`                 | No `enum`, `namespace`, parameter props | Use `const` objects or union types      |

### Type Imports

```typescript
// ✅ ALWAYS use import type for type-only imports
import type { Metadata } from 'next'
import { NextResponse } from 'next/server'

// ❌ NEVER mix type and value imports in one statement (use separate lines)
```

### Never Use

```typescript
// ❌ any
const data: any = JSON.parse(raw) // → use Zod schema
// ❌ @ts-ignore / @ts-expect-error
// ❌ as unknown as Type                 // → use Zod parse
// ❌ Non-null assertion (!) in most cases
document.getElementById('x')!.innerHTML // → use guard: if (!el) throw
// ❌ enum                              // → use const object or union type
// ❌ namespace                         // → use ES modules
// ❌ Function() / new Function()        // → blocked by no-restricted-syntax
```

---

## 5. Next.js Rules

### Server Components vs Client Components

```typescript
// ✅ Server Component (default) — no 'use client' directive
// Can: query DB (Prisma), use async/await, server-only APIs
// Cannot: use hooks (useState, useEffect), event handlers, browser APIs
export default async function Page() {
  const users = await db.user.findMany()
  return <UserList users={users} />
}

// ✅ Client Component — add 'use client' at top of file
'use client'
import { useState } from 'react'
export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### Server-Only Code Isolation

```typescript
// ✅ src/lib/db.ts imports 'server-only' — crashes if imported in client bundle
import 'server-only'
import { PrismaClient } from '@prisma/client'

// ❌ NEVER import db.ts from a Client Component
// ❌ NEVER import PrismaClient directly in a component without going through db.ts
```

### Route Handlers (API Routes)

```typescript
// src/app/api/users/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createUserSchema } from '@/lib/validations/user'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // ✅ Parse at boundary — validate before touching DB
  const parsed = createUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422 },
    )
  }

  const user = await db.user.create({ data: parsed.data })
  return NextResponse.json(user, { status: 201 })
}
```

### React Rules (still apply to Client Components)

```typescript
// ✅ Function components, PascalCase
function UserProfile({ userId }: UserProfileProps) {
  const [name, setName] = useState('')
  return <div>{name}</div>
}

// ✅ Hooks at top level, never conditional
// ✅ useCallback for stable references
// ✅ useEffect cleanup
```

### Event Handlers

```typescript
// ✅ Stable reference via useCallback
const handleClick = useCallback(() => {
  setCount((prev) => prev + 1) // ✅ functional update
}, [])

// ❌ Inline arrow in JSX creates new ref every render (React Compiler helps but still avoid)
```

### Next.js-specific ESLint rules (active)

| Rule                                   | What it catches                               |
| -------------------------------------- | --------------------------------------------- |
| `@next/next/no-img-element`            | Use `next/image` instead of `<img>`           |
| `@next/next/no-html-link-for-pages`    | Use `next/link` instead of `<a>` for internal |
| `@next/next/no-sync-scripts`           | Use `next/script` for third-party scripts     |
| `@next/next/no-async-client-component` | `async` in client components — runtime error  |
| `react-compiler/react-compiler`        | Violations of React Compiler rules            |
| `react-rsc/*`                          | RSC boundary violations                       |

---

## 6. Security Rules

### ESLint Security Plugins

This project runs **4 dedicated security linting plugins** — following the #1 recommendation from [goldbergyoni/nodebestpractices](https://github.com/goldbergyoni/nodebestpractices) (105K★):

| Plugin                           | Rules | Catches                                                                                |
| -------------------------------- | ----- | -------------------------------------------------------------------------------------- |
| **eslint-plugin-security**       | 10    | `eval()`, `child_process`, path traversal, ReDoS, timing attacks, pseudo-random crypto |
| **eslint-plugin-no-unsanitized** | 6     | DOM XSS: `innerHTML`, `document.write`, `location.href` sinks                          |
| **eslint-plugin-no-secrets**     | 1     | Entropy-based secret detection (API keys, tokens in source code)                       |
| **eslint-plugin-sonarjs**        | ~70   | Code quality + security smells: cognitive complexity, duplicate strings, bug patterns  |

### Dynamic Code Execution

```typescript
// ❌ BLOCKED by no-restricted-syntax — AST-level prohibition
Function('return ' + userInput)() // ERROR
new Function('return ' + userInput)() // ERROR
globalThis.Function('return ' + userInput)() // ERROR

// ❌ BLOCKED by eslint-plugin-security
eval(userInput) // ERROR
exec('rm -rf ' + userInput) // ERROR
```

### Caught Errors

```typescript
// ❌ BLOCKED by preserve-caught-error (ESLint v10)
try {
  await fetch('/api')
} catch {
  // ERROR: error swallowed
  return null
}

// ✅ Correct
try {
  await fetch('/api')
} catch (error) {
  console.error('Fetch failed:', error)
  return null
}
```

### Secret Detection (two layers)

| Layer          | Tool                       | When                                                            |
| -------------- | -------------------------- | --------------------------------------------------------------- |
| **Editor**     | `eslint-plugin-no-secrets` | While typing — entropy-based detection                          |
| **Pre-commit** | Gitleaks                   | Before commit — 80+ regex patterns (AWS, GitHub, Stripe tokens) |

### Server-Side Data Access Security

```typescript
// ✅ Prisma queries only in server components / route handlers / server actions
// ✅ Always import db from '@/lib/db' (has 'server-only' guard)
// ❌ NEVER pass Prisma client to client components
// ❌ NEVER expose raw DB records to client — validate with Zod first, strip sensitive fields
// ✅ Use Zod to validate response shape before returning from API routes
```

### React Security

```html
<!-- ❌ BLOCKED by eslint-plugin-no-unsanitized -->
<div dangerouslySetInnerHTML="{{" __html: userContent }} />
<!-- ERROR -->

<!-- ✅ Use a sanitizer -->
<div dangerouslySetInnerHTML="{{" __html: DOMPurify.sanitize(userContent) }} />

<!-- ✅ target="_blank" requires rel="noreferrer" -->
<a href="https://example.com" target="_blank" rel="noreferrer">Link</a>
```

---

## 7. Prisma Rules

### Schema-First Development

```prisma
// prisma/schema.prisma — single source of truth for DB shape
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
  @@map("users")  // ← snake_case table name in DB
}
```

### db.ts Singleton (server-only)

```typescript
// src/lib/db.ts
import 'server-only'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ?? new PrismaClient({ ... })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
```

### Migration Workflow

```bash
# After changing schema.prisma:
npm run db:migrate    # creates + applies migration (dev)
npm run db:push       # syncs schema without migration (prototyping)

# Production:
npm run db:migrate:deploy  # applies pending migrations
```

### Prisma + Zod (parse at boundary)

```typescript
// ✅ Define Zod schema separately from Prisma schema
// Prisma schema = DB shape. Zod schema = API/validated shape.
// They may differ (e.g., Prisma has createdAt, API returns ISO string)

// src/lib/validations/user.ts
export const createUserSchema = z.object({
  email: z.email(),
  name: z.string().min(1).max(100).optional(),
})

// In route handler:
const parsed = createUserSchema.safeParse(body)
if (!parsed.success) return NextResponse.json({ error: '...' }, { status: 422 })
await db.user.create({ data: parsed.data })
```

---

## 8. Imports & Sorting

Imports are auto-sorted by `eslint-plugin-perfectionist` (natural order, ascending). The order is:

```
builtin  → external  → internal (@/)  → parent (../)  → sibling (./)  → index  → type
```

```typescript
// ✅ Correct order (auto-fixed on save/lint)
import { NextResponse } from 'next/server' // external
import { db } from '@/lib/db' // internal (@ alias)
import { createUserSchema } from '@/lib/validations/user'
import { Button } from '../components/Button' // parent
import { formatDate } from './utils' // sibling
import type { User } from './types' // type
```

---

## 9. Styling with Tailwind v4

### Class Merging

```typescript
import { cn } from '@/lib/utils'

// ✅ Use cn() for conditional classes
<div className={cn('base-class', isActive && 'active-class', className)} />

// ❌ Manual string concatenation
<div className={`base-class ${isActive ? 'active-class' : ''} ${className}`} />
```

### Component Variants (CVA)

```typescript
import { cva } from 'class-variance-authority'

const buttonVariants = cva('rounded-lg font-medium transition-colors', {
  variants: {
    variant: {
      primary: 'bg-accent text-white hover:bg-accent-dark',
      secondary: 'bg-accent-bg text-accent border border-accent-border',
    },
    size: {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})
```

### Custom Design Tokens

Defined in `src/app/globals.css` via `@theme`. Use them directly in className:

```html
<div className="bg-bg text-text border-border">Content</div>
```

### Tailwind v4 Cheatsheet

```css
/* ✅ Tailwind v4: @theme for tokens, @import for plugins */
@import 'tailwindcss';
@theme { --color-accent: #aa3bff; }

/* ✅ Custom variants via @variant */
@variant dark { :root { ... } }

/* ❌ No tailwind.config.js — v4 uses CSS-first config */
```

---

## 10. Runtime Validation (Zod v4)

```typescript
import { z } from 'zod'

// Define schema → get type for free
const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(0).max(150).optional(),
})

type User = z.infer<typeof userSchema> // Auto-inferred!

// Validate at boundaries (API responses, form data, localStorage)
function processUser(data: unknown): User {
  return userSchema.parse(data) // throws with detailed error on mismatch
}

function safeProcessUser(data: unknown): User | null {
  const result = userSchema.safeParse(data)
  return result.success ? result.data : null
}
```

**Rule:** Parse at the boundary, never pass `unknown`/`any` deeper into the app. Zod schemas are the single source of truth for data shapes.

---

## 11. Naming Conventions

| Category                | Convention                      | Example                           |
| ----------------------- | ------------------------------- | --------------------------------- |
| **Components**          | PascalCase                      | `UserProfile.tsx`                 |
| **Functions/variables** | camelCase                       | `formatDate`, `userName`          |
| **Types/interfaces**    | PascalCase                      | `UserProfileProps`, `ApiResponse` |
| **Files**               | camelCase or kebab-case         | `useAuth.ts`, `user-profile.tsx`  |
| **Route handlers**      | `route.ts` in `app/api/.../`    | `src/app/api/users/route.ts`      |
| **Constants**           | UPPER_SNAKE (module-level only) | `MAX_RETRIES`                     |
| **Event handlers**      | `handle` + Event                | `handleClick`, `handleSubmit`     |
| **Boolean props**       | `is`/`has`/`should` prefix      | `isLoading`, `hasError`           |

---

## 12. File Structure

```
src/
  app/                     # Next.js App Router
    layout.tsx             # Root layout (metadata, fonts)
    page.tsx               # Home page (server component)
    globals.css            # Tailwind v4 imports + @theme tokens
    api/                   # API route handlers
      users/
        route.ts           # GET/POST /api/users
  lib/
    utils.ts               # cn() helper (clsx + tailwind-merge + CVA)
    db.ts                  # Prisma client singleton (server-only)
    validations/           # Zod schemas (parse at boundary)
      user.ts
  components/              # Reusable UI components (client or shared)
  hooks/                   # Custom hooks
  types/                   # Shared TypeScript types
prisma/
  schema.prisma            # Prisma schema (single source of truth for DB)
  migrations/              # Generated migrations
  seed.ts                  # Seed script
.github/
  workflows/
    ci.yml                 # Lint + typecheck + knip + prisma + build gates
    codeql.yml             # Semantic SAST (weekly)
    dependency-review.yml  # Block CVEs in PRs
    scorecard.yml          # OpenSSF Scorecard security audit
    prisma.yml             # Schema validation + migration drift
```

**Rules:**

- No barrel files (`index.ts` re-exporting everything) — they hurt tree-shaking and build speed
- Import directly from the source file
- Keep files under 250 lines (enforced by review, not tooling)
- Server-only code (`db.ts`, `validations/`) must import `server-only` package

---

## 13. Common Patterns

### Data Fetching (Server Component)

```typescript
// ✅ Server Component — direct DB access, no API needed
export default async function UsersPage() {
  const users = await db.user.findMany({ take: 100 })
  const parsed = userListSchema.safeParse(users.map(/* ... */))
  if (!parsed.success) return <ErrorState />
  return <UserList users={parsed.data} />
}
```

### Data Fetching (Client Component → API Route)

```typescript
'use client'
import { useEffect, useState } from 'react'
import { userSchema } from '@/lib/validations/user'

function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/users')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: unknown = await res.json()
        const parsed = userSchema.array().parse(data) // ✅ validate at boundary
        if (!cancelled) setUsers(parsed)
      } catch (error) {
        console.error(error)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { users, isLoading }
}
```

### Conditional Rendering

```typescript
function UserList({ users, isLoading, error }: UserListProps) {
  if (isLoading) return <Spinner />
  if (error) return <ErrorBanner message={error.message} />
  if (users.length === 0) return <EmptyState />
  return <ul>{users.map((user) => <UserItem key={user.id} user={user} />)}</ul>
}
```

### Form Handling (Server Action pattern)

```typescript
// ✅ Server Action — validated with Zod, uses Prisma directly
'use server'
import { db } from '@/lib/db'
import { createUserSchema } from '@/lib/validations/user'

async function createUser(formData: FormData) {
  const parsed = createUserSchema.safeParse({
    email: formData.get('email'),
    name: formData.get('name'),
  })
  if (!parsed.success) return { error: parsed.error.issues }
  await db.user.create({ data: parsed.data })
}
```

---

## 14. Anti-Patterns — NEVER Do These

| ❌ Anti-pattern                                     | ✅ Correct                                            |
| --------------------------------------------------- | ----------------------------------------------------- |
| `const x: any = ...`                                | Use Zod schema or proper type                         |
| `// @ts-ignore`                                     | Fix the type error                                    |
| `as unknown as Type`                                | Use Zod parse or type guard                           |
| `eval()`, `new Function()`, `globalThis.Function()` | BLOCKED — no dynamic code execution                   |
| `element.innerHTML = userData`                      | BLOCKED — DOM XSS sink. Use `textContent` or sanitize |
| `arr.map((_, i) => <Item key={i} />)`               | Use a stable unique key                               |
| `useEffect(async () => { ... })`                    | Define async function inside, call it                 |
| `target="_blank"` without `rel="noreferrer"`        | Always add `rel="noreferrer"`                         |
| `catch { }` or `catch (e) { }` (empty catch)        | BLOCKED — `preserve-caught-error`. Log or re-throw.   |
| Barrel files (`export * from './foo'`)              | Import directly from source files                     |
| `document.getElementById('root')!`                  | Guard: `if (!el) throw new Error(...)`                |
| String className concatenation                      | Use `cn()` from `src/lib/utils.ts`                    |
| Committing API keys, tokens, passwords              | BLOCKED — Gitleaks (pre-commit) + no-secrets (IDE)    |
| Importing `db.ts` from Client Components            | BLOCKED — `server-only` guard. Use API routes.        |
| Passing raw Prisma records to client                | Validate with Zod, strip sensitive fields             |
| `@next/next/no-img-element` violation               | Use `next/image` for optimization                     |
| `@next/next/no-html-link-for-pages` violation       | Use `next/link` for internal navigation               |
| `async` in Client Component                         | BLOCKED — move to Server Component or API route       |
| Missing `'use client'` when using hooks             | Add `'use client'` at top of file                     |

---

## 15. When Things Go Wrong

### Lint errors after saving?

```bash
npm run lint:fix    # Auto-fix what's fixable, see what remains
npx oxlint .        # Read the error — fix it
```

### Type errors after changing types?

```bash
npm run typecheck   # See all type errors
npm run db:generate # Regenerate Prisma client if schema changed
```

### Dead code?

```bash
npm run knip        # Find unused files/exports/deps
npm run knip:fix    # Auto-remove from package.json
```

### Prisma errors?

```bash
npm run db:validate  # Check schema syntax
npm run db:generate   # Regenerate client after schema change
npm run db:migrate    # Sync DB with schema
npx prisma studio     # GUI to inspect DB
```

### Security lint errors?

```bash
# Read the rule description, understand the attack vector, fix the code
# If false positive: disable for that line with explanation comment
```

### Secret accidentally committed?

```bash
# 1. Rotate the secret immediately (API key, token, password)
# 2. git reset HEAD~1 to uncommit
# 3. Add the file to .gitignore if needed
# 4. If pushed to remote — rotate and force-push if safe
```

### Dev server not updating?

```bash
# Delete .next cache
rm -rf .next
npm run dev
```

---

## 16. CI Pipeline

### GitHub Actions Workflows

| Workflow              | Trigger               | Gates                                                                           |
| --------------------- | --------------------- | ------------------------------------------------------------------------------- |
| **CI**                | push, PR, merge_group | lint:ci → typecheck → knip → prisma-validate → build (parallel, aggregate gate) |
| **Prisma Check**      | prisma/ changes       | Schema validation + migration drift detection                                   |
| **CodeQL**            | push to main, weekly  | Semantic SAST — data-flow vulnerability analysis                                |
| **Dependency Review** | every PR              | Blocks PRs adding packages with CRITICAL CVEs                                   |
| **OpenSSF Scorecard** | weekly, push to main  | 18 security health checks → SARIF report in Security tab                        |

### CI Pipeline Steps

```
1. npm ci --legacy-peer-deps
2. npx oxfmt --check
3. npm run lint:ci        (oxlint --deny-warnings + eslint)
4. npm run typecheck      (tsc --noEmit --skipLibCheck)
5. npm run knip           (dead code check)
6. npm run db:validate     (prisma schema valid)
7. npm run db:generate    (prisma client generated)
8. npm run build          (next build)
```

### CI Security Practices

- **Pinned action SHAs** — all GitHub Actions use full commit SHAs, not `@latest` or `@main`
- **Least privilege** — `permissions: contents: read` by default, elevated only where needed
- **`required` aggregate job** — fails the merge if any quality gate was skipped or failed

---

## 17. Summary Checklist

Before marking work as done:

- [ ] `npx oxfmt --check` passes (0 changes needed)
- [ ] `npx oxlint .` passes (0 errors)
- [ ] `npx eslint` passes (0 errors, 0 warnings)
- [ ] `npx tsc --noEmit --skipLibCheck` passes (0 errors)
- [ ] `npx knip` passes (0 errors)
- [ ] `npx prisma validate` passes
- [ ] `npm run build` passes
- [ ] No `any`, `@ts-ignore`, `as unknown as Type` in diff
- [ ] No `eval()`, `Function()`, `globalThis.Function()` — blocked at AST level
- [ ] No `innerHTML`/`outerHTML`/`document.write` with user data — blocked by no-unsanitized
- [ ] No `catch {}` without error variable — blocked by preserve-caught-error
- [ ] No secrets in source code — checked by Gitleaks (pre-commit) + no-secrets (IDE)
- [ ] No array index as key
- [ ] All `target="_blank"` have `rel="noreferrer"`
- [ ] All async operations have error handling
- [ ] Data from outside (API, localStorage) is validated with Zod
- [ ] Server-only code imports `server-only` package
- [ ] No `db.ts` / Prisma imports in Client Components
- [ ] New dependencies are justified (not "just in case")
