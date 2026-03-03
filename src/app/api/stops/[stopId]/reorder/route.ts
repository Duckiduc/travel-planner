import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { z } from 'zod'

const schema = z.object({ order: z.number().int() })

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ stopId: string }> }
) {
  const { stopId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const stop = await prisma.destinationStop.findFirst({
    where: { id: stopId },
    include: { trip: true },
  })
  if (!stop || stop.trip.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const updated = await prisma.destinationStop.update({
    where: { id: stopId },
    data: { order: parsed.data.order },
  })
  return NextResponse.json(updated)
}
