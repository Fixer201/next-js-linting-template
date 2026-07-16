import 'server-only'
import type { Prisma } from '@/generated/prisma/client'

export const publicUserSelect = {
  createdAt: true,
  email: true,
  id: true,
  name: true,
  updatedAt: true,
} satisfies Prisma.UserSelect
