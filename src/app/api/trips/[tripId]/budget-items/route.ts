import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  category: z.enum(['TRANSPORT', 'LODGING', 'FOOD', 'ACTIVITY', 'SHOPPING', 'HEALTH', 'ADMIN', 'OTHER']),
  description: z.string().min(1),
  planned: z.number(),
  actual: z.number().optional().nullable(),
  stopId: z.string().optional().nullable(),
  currency: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

async function verifyOwner(tripId: string, userId: string) {
  return prisma.trip.findFirst({ where: { id: tripId, userId } })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const trip = await verifyOwner(tripId, session.user.id)
  if (!trip) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const items = await prisma.budgetItem.findMany({
    where: { tripId: tripId },
    include: { stop: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(items)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const trip = await verifyOwner(tripId, session.user.id)
  if (!trip) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const item = await prisma.budgetItem.create({
    data: { tripId: tripId, ...parsed.data },
  })
  return NextResponse.json(item, { status: 201 })
}
