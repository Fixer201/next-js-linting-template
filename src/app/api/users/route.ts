import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createUserSchema, userSchema } from '@/lib/validations/user'

// POST /api/users — create a user.
// Demonstrates the "parse at boundary" pattern:
// 1. Validate request body with Zod before it touches Prisma.
// 2. Insert via Prisma.
// 3. Validate the response shape with Zod before returning.
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = createUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422 },
    )
  }

  try {
    const created = await db.user.create({
      data: { email: parsed.data.email, name: parsed.data.name ?? null },
    })

    const response = userSchema.safeParse({
      createdAt: created.createdAt.toISOString(),
      email: created.email,
      id: created.id,
      name: created.name,
      updatedAt: created.updatedAt.toISOString(),
    })

    if (!response.success) {
      return NextResponse.json({ error: 'Response validation failed' }, { status: 500 })
    }

    return NextResponse.json(response.data, { status: 201 })
  } catch (error: unknown) {
    // Prisma unique constraint violation (P2002) — email already exists.
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 })
    }

    console.error('Failed to create user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/users — list users.
export async function GET() {
  const rawUsers = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const response = userSchema.array().safeParse(
    rawUsers.map((user) => ({
      createdAt: user.createdAt.toISOString(),
      email: user.email,
      id: user.id,
      name: user.name,
      updatedAt: user.updatedAt.toISOString(),
    })),
  )

  if (!response.success) {
    return NextResponse.json({ error: 'Response validation failed' }, { status: 500 })
  }

  return NextResponse.json(response.data)
}
