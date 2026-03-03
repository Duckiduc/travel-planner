import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ tripId: string; stopId: string }> }
) {
  const { tripId, stopId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const stop = await prisma.destinationStop.findFirst({
    where: { id: stopId, tripId: tripId },
    include: { trip: true },
  })
  if (!stop || stop.trip.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.destinationStop.delete({ where: { id: stopId } })
  return NextResponse.json({ success: true })
}
