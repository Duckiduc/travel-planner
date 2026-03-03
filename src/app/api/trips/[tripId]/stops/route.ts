import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  country: z.string().optional().nullable(),
  arrivalDate: z.string().optional().nullable(),
  departureDate: z.string().optional().nullable(),
  order: z.number().int().optional(),
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

  const stops = await prisma.destinationStop.findMany({
    where: { tripId: tripId },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(stops)
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
  const count = await prisma.destinationStop.count({ where: { tripId: tripId } })
  const stop = await prisma.destinationStop.create({
    data: {
      tripId: tripId,
      name: data.name,
      country: data.country,
      arrivalDate: data.arrivalDate ? new Date(data.arrivalDate) : null,
      departureDate: data.departureDate ? new Date(data.departureDate) : null,
      order: data.order ?? count,
      notes: data.notes,
    },
  })
  return NextResponse.json(stop, { status: 201 })
}
