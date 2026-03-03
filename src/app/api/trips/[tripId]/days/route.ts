import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  date: z.string(),
  stopId: z.string().optional().nullable(),
  pace: z.enum(['LIGHT', 'MODERATE', 'BUSY']).optional(),
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

  const days = await prisma.itineraryDay.findMany({
    where: { tripId: tripId },
    include: { items: { orderBy: { order: 'asc' } }, stop: true },
    orderBy: { date: 'asc' },
  })
  return NextResponse.json(days)
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

  const data = parsed.data
  const day = await prisma.itineraryDay.create({
    data: {
      tripId: tripId,
      date: new Date(data.date),
      stopId: data.stopId ?? null,
      pace: data.pace ?? 'MODERATE',
      notes: data.notes,
    },
    include: { items: true, stop: true },
  })
  return NextResponse.json(day, { status: 201 })
}
