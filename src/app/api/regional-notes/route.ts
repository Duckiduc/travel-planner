import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const country = searchParams.get('country')

  const notes = await prisma.regionalNote.findMany({
    where: country ? { country: { equals: country, mode: 'insensitive' } } : undefined,
    orderBy: [{ country: 'asc' }, { category: 'asc' }, { title: 'asc' }],
  })
  return NextResponse.json(notes)
}
