import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import Papa from 'papaparse'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId: session.user.id },
  })
  if (!trip) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const items = await prisma.checklistItem.findMany({
    where: { tripId: tripId },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  })

  const rows = items.map((item) => ({
    Title: item.title,
    Category: item.category ?? '',
    Priority: item.priority,
    Completed: item.completed ? 'Yes' : 'No',
    'Due Date': item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '',
    'Assigned To': item.assignedTo ?? '',
    Notes: item.notes ?? '',
  }))

  const csv = Papa.unparse(rows)

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${trip.title.replace(/[^a-z0-9]/gi, '_')}_checklist.csv"`,
    },
  })
}
