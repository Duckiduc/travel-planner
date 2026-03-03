import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  items: z.array(z.object({
    title: z.string().min(1),
    category: z.string().optional().nullable(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    order: z.number().int().optional(),
  })).optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const templates = await prisma.checklistTemplate.findMany({
    include: { items: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(templates)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const data = parsed.data
  const template = await prisma.checklistTemplate.create({
    data: {
      name: data.name,
      description: data.description,
      items: data.items
        ? {
            create: data.items.map((item, idx) => ({
              title: item.title,
              category: item.category,
              priority: item.priority ?? 'MEDIUM',
              order: item.order ?? idx,
            })),
          }
        : undefined,
    },
    include: { items: { orderBy: { order: 'asc' } } },
  })
  return NextResponse.json(template, { status: 201 })
}
