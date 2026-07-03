import { z } from 'zod'

// Schema for creating a user — parse at the boundary (API route / server action).
export const createUserSchema = z.object({
  email: z.email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
})

// Schema for a single user (response shape from Prisma).
export const userSchema = z.object({
  createdAt: z.string(),
  email: z.string(),
  id: z.string(),
  name: z.string().nullable(),
  updatedAt: z.string(),
})

export const userListSchema = z.array(userSchema)
