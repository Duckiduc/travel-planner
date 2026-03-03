import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

type JsPDFWithAutoTable = jsPDF & { lastAutoTable: { finalY: number } }

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId: session.user.id },
    include: {
      stops: { orderBy: { order: 'asc' } },
      days: {
        include: { items: { orderBy: { order: 'asc' } }, stop: true },
        orderBy: { date: 'asc' },
      },
    },
  })

  if (!trip) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const doc = new jsPDF()

  // Title
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(trip.title, 14, 20)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100)
  if (trip.startDate && trip.endDate) {
    doc.text(
      `${new Date(trip.startDate).toLocaleDateString()} – ${new Date(trip.endDate).toLocaleDateString()}`,
      14,
      28
    )
  }
  doc.setTextColor(0)

  let y = 38

  // Stops overview
  if (trip.stops.length > 0) {
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Destinations', 14, y)
    y += 6
    autoTable(doc, {
      startY: y,
      head: [['Destination', 'Country', 'Arrival', 'Departure']],
      body: trip.stops.map((s) => [
        s.name,
        s.country ?? '',
        s.arrivalDate ? new Date(s.arrivalDate).toLocaleDateString() : '',
        s.departureDate ? new Date(s.departureDate).toLocaleDateString() : '',
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
    })
    y = (doc as JsPDFWithAutoTable).lastAutoTable.finalY + 10
  }

  // Itinerary days
  for (const day of trip.days) {
    if (y > 260) { doc.addPage(); y = 20 }

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    const dayLabel = new Date(day.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    doc.text(`${dayLabel}${day.stop ? ` — ${day.stop.name}` : ''}`, 14, y)
    y += 5

    if (day.items.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [['Time', 'Activity', 'Description']],
        body: day.items.map((item) => [
          item.startTime ? `${item.startTime}${item.endTime ? `–${item.endTime}` : ''}` : '',
          item.title,
          item.description ?? '',
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [99, 102, 241] },
        columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 60 } },
      })
      y = (doc as JsPDFWithAutoTable).lastAutoTable.finalY + 8
    } else {
      doc.setFontSize(8)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(120)
      doc.text('No activities planned', 18, y)
      doc.setTextColor(0)
      y += 8
    }
  }

  const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${trip.title.replace(/[^a-z0-9]/gi, '_')}_itinerary.pdf"`,
    },
  })
}
