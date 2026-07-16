import 'server-only'
import { z } from 'zod'

const serverEnvSchema = z.object({
  DATABASE_POOL_SIZE: z.coerce.number().int().min(1).max(50).default(10),
  DATABASE_URL: z.string().regex(/^postgres(?:ql)?:\/\//u, 'Expected a PostgreSQL URL'),
  PRISMA_LOG_QUERIES: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
})

export const env = serverEnvSchema.parse({
  DATABASE_POOL_SIZE: process.env['DATABASE_POOL_SIZE'],
  DATABASE_URL: process.env['DATABASE_URL'],
  PRISMA_LOG_QUERIES: process.env['PRISMA_LOG_QUERIES'],
})
