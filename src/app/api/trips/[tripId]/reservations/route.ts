import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  type: z.enum(['TRANSPORT', 'LODGING', 'ACTIVITY']),
  title: z.string().min(1),
  provider: z.string().optional().nullable(),
  confirmRef: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  amount: z.number().optional().nullable(),
  currency: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  attachmentUrl: z.string().optional().nullable(),
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

  const reservations = await prisma.reservation.findMany({
    where: { tripId: tripId },
    orderBy: [{ startDate: 'asc' }, { createdAt: 'asc' }],
  })
  return NextResponse.json(reservations)
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
  const reservation = await prisma.reservation.create({
    data: {
      tripId: tripId,
      type: data.type,
      title: data.title,
      provider: data.provider,
      confirmRef: data.confirmRef,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      notes: data.notes,
      attachmentUrl: data.attachmentUrl,
    },
  })
  return NextResponse.json(reservation, { status: 201 })
}
