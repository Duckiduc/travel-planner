import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1).optional(),
  completed: z.boolean().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  category: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string; itemId: string }> }
) {
  const { tripId, itemId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const item = await prisma.checklistItem.findFirst({
    where: { id: itemId, tripId: tripId },
    include: { trip: true },
  })
  if (!item || item.trip.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const data = parsed.data
  const updated = await prisma.checklistItem.update({
    where: { id: itemId },
    data: {
      ...data,
      dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ tripId: string; itemId: string }> }
) {
  const { tripId, itemId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const item = await prisma.checklistItem.findFirst({
    where: { id: itemId, tripId: tripId },
    include: { trip: true },
  })
  if (!item || item.trip.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.checklistItem.delete({ where: { id: itemId } })
  return NextResponse.json({ success: true })
}
