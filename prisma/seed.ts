import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const users = [
  { email: 'alice@example.com', name: 'Alice' },
  { email: 'bob@example.com', name: 'Bob' },
]

async function main() {
  await Promise.all(
    users.map((user) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: user,
      }),
    ),
  )

  console.log(`Seeded ${users.length} users`)
}

try {
  await main()
} catch (error: unknown) {
  console.error(error)
  process.exit(1)
} finally {
  await prisma.$disconnect()
}
