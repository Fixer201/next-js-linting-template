import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'

const databaseUrl = process.env['DATABASE_URL']

if (databaseUrl === undefined || databaseUrl.length === 0) {
  throw new Error('DATABASE_URL is required to seed the database')
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
})

const users = [
  { email: 'alice@example.com', name: 'Alice' },
  { email: 'bob@example.com', name: 'Bob' },
]

async function main() {
  await Promise.all(
    users.map((user) =>
      prisma.user.upsert({
        create: user,
        select: { id: true },
        update: {},
        where: { email: user.email },
      }),
    ),
  )

  console.log(`Seeded ${users.length} users`)
}

try {
  await main()
} catch (error: unknown) {
  console.error('Failed to seed the database:', error)
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
