import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: session.user.id } })
  if (!trip) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const items = await prisma.budgetItem.findMany({ where: { tripId: tripId } })

  const categories = ['TRANSPORT', 'LODGING', 'FOOD', 'ACTIVITY', 'SHOPPING', 'HEALTH', 'ADMIN', 'OTHER'] as const

  const summary = categories.map((cat) => {
    const catItems = items.filter((i) => i.category === cat)
    return {
      category: cat,
      planned: catItems.reduce((sum, i) => sum + i.planned, 0),
      actual: catItems.reduce((sum, i) => sum + (i.actual ?? 0), 0),
      count: catItems.length,
    }
  })

  const totals = {
    planned: items.reduce((sum, i) => sum + i.planned, 0),
    actual: items.reduce((sum, i) => sum + (i.actual ?? 0), 0),
  }

  return NextResponse.json({ summary, totals, currency: trip.currency })
}
