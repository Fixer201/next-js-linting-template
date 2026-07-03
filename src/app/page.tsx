import { db } from '@/lib/db'
import { userListSchema } from '@/lib/validations/user'

// Server Component — reads from DB and validates at the boundary with Zod.
export default async function Home() {
  const rawUsers = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

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
        <p className="text-text-h text-xl">Failed to load users</p>
        <pre className="bg-code-bg mt-4 overflow-auto rounded p-4 text-sm">
          {JSON.stringify(parsed.error.issues, null, 2)}
        </pre>
      </main>
    )
  }

  const users = parsed.data

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col p-8">
      <h1 className="text-text-h mb-6 text-3xl font-medium tracking-tight">
        Next.js Linting Template
      </h1>
      <p className="mb-8">
        Max-strictness Next.js + Prisma + Tailwind starter. Demo reads users from PostgreSQL via
        Prisma and validates with Zod.
      </p>

      <section>
        <h2 className="text-text-h mb-4 text-xl font-medium">Users</h2>
        {users.length === 0 ? (
          <p className="text-text">
            No users yet. Run{' '}
            <code className="bg-code-bg rounded px-2 py-1 font-mono text-sm">npm run db:seed</code>{' '}
            to add demo data.
          </p>
        ) : (
          <ul className="space-y-2">
            {users.map((user) => (
              <li
                className="border-border bg-bg flex items-center justify-between rounded-lg border p-3"
                key={user.id}
              >
                <span className="text-text-h font-medium">{user.name ?? 'Unnamed'}</span>
                <code className="bg-code-bg text-text rounded px-2 py-1 text-sm">{user.email}</code>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-text-h mb-4 text-xl font-medium">Create User</h2>
        <p className="text-text mb-2">
          POST to <code className="bg-code-bg rounded px-2 py-1 font-mono text-sm">/api/users</code>{' '}
          with JSON body:
        </p>
        <pre className="bg-code-bg overflow-auto rounded p-4 text-sm">
          {`{
  "email": "user@example.com",
  "name": "User Name"
}`}
        </pre>
      </section>
    </main>
  )
}
