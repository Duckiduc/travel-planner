import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  order: z.number().int().optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ dayId: string }> }
) {
  const { dayId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const day = await prisma.itineraryDay.findFirst({
    where: { id: dayId },
    include: { trip: true },
  })
  if (!day || day.trip.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const items = await prisma.itineraryItem.findMany({
    where: { dayId: dayId },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(items)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ dayId: string }> }
) {
  const { dayId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const day = await prisma.itineraryDay.findFirst({
    where: { id: dayId },
    include: { trip: true },
  })
  if (!day || day.trip.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const count = await prisma.itineraryItem.count({ where: { dayId: dayId } })
  const item = await prisma.itineraryItem.create({
    data: { dayId: dayId, ...parsed.data, order: parsed.data.order ?? count },
  })
  return NextResponse.json(item, { status: 201 })
}
