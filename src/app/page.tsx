import { db } from '@/lib/db'
import { userListSchema } from '@/lib/validations/user'

// Server Component — reads from DB and validates at the boundary with Zod.
// Gracefully handles missing DATABASE_URL (template setup scenario).
export default async function Home() {
  let rawUsers: Awaited<ReturnType<typeof db.user.findMany>>

  try {
    rawUsers = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    })
  } catch {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col p-8">
        <h1 className="mb-6 text-3xl font-medium tracking-tight text-text-h">
          Next.js Linting Template
        </h1>
        <p className="mb-8">Max-strictness Next.js + Prisma + Tailwind starter.</p>
        <section className="rounded-lg border border-border p-4">
          <p className="mb-2 font-medium text-text-h">Database not configured</p>
          <p className="mb-2 text-text">
            Copy{' '}
            <code className="rounded bg-code-bg px-2 py-1 font-mono text-sm">.env.example</code> to{' '}
            <code className="rounded bg-code-bg px-2 py-1 font-mono text-sm">.env</code> and set
            your{' '}
            <code className="rounded bg-code-bg px-2 py-1 font-mono text-sm">DATABASE_URL</code>.
          </p>
          <pre className="overflow-auto rounded bg-code-bg p-4 text-sm">
            {`cp .env.example .env
npm run db:generate
npm run db:migrate
npm run db:seed`}
          </pre>
        </section>
      </main>
    )
  }

  // Parse at the boundary — never trust raw DB output shape in app logic.
  const parsed = userListSchema.safeParse(
    rawUsers.map((user) => ({
      createdAt: user.createdAt.toISOString(),
      email: user.email,
      id: user.id,
      name: user.name,
      updatedAt: user.updatedAt.toISOString(),
    })),
  )

  if (!parsed.success) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <p className="text-xl text-text-h">Failed to load users</p>
        <pre className="mt-4 overflow-auto rounded bg-code-bg p-4 text-sm">
          {JSON.stringify(parsed.error.issues, null, 2)}
        </pre>
      </main>
    )
  }

  const users = parsed.data

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col p-8">
      <h1 className="mb-6 text-3xl font-medium tracking-tight text-text-h">
        Next.js Linting Template
      </h1>
      <p className="mb-8">
        Max-strictness Next.js + Prisma + Tailwind starter. Demo reads users from PostgreSQL via
        Prisma and validates with Zod.
      </p>

      <section>
        <h2 className="mb-4 text-xl font-medium text-text-h">Users</h2>
        {users.length === 0 ? (
          <p className="text-text">
            No users yet. Run{' '}
            <code className="rounded bg-code-bg px-2 py-1 font-mono text-sm">npm run db:seed</code>{' '}
            to add demo data.
          </p>
        ) : (
          <ul className="space-y-2">
            {users.map((user) => (
              <li
                className="flex items-center justify-between rounded-lg border border-border bg-bg p-3"
                key={user.id}
              >
                <span className="font-medium text-text-h">{user.name ?? 'Unnamed'}</span>
                <code className="rounded bg-code-bg px-2 py-1 text-sm text-text">{user.email}</code>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-medium text-text-h">Create User</h2>
        <p className="mb-2 text-text">
          POST to <code className="rounded bg-code-bg px-2 py-1 font-mono text-sm">/api/users</code>{' '}
          with JSON body:
        </p>
        <pre className="overflow-auto rounded bg-code-bg p-4 text-sm">
          {`{
  "email": "user@example.com",
  "name": "User Name"
}`}
        </pre>
      </section>
    </main>
  )
}
