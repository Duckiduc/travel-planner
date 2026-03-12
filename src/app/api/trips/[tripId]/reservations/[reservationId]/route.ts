import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  type: z.enum(["TRANSPORT", "LODGING", "ACTIVITY"]),
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
});

async function getReservationForUser(
  reservationId: string,
  tripId: string,
  userId: string,
) {
  return prisma.reservation
    .findFirst({
      where: { id: reservationId, tripId },
      include: { trip: true },
    })
    .then((reservation) => {
      if (!reservation || reservation.trip.userId !== userId) return null;
      return reservation;
    });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string; reservationId: string }> },
) {
  const { tripId, reservationId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reservation = await getReservationForUser(
    reservationId,
    tripId,
    session.user.id,
  );
  if (!reservation)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );

  const data = parsed.data;
  const updated = await prisma.reservation.update({
    where: { id: reservationId },
    data: {
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
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ tripId: string; reservationId: string }> },
) {
  const { tripId, reservationId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reservation = await getReservationForUser(
    reservationId,
    tripId,
    session.user.id,
  );
  if (!reservation)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.reservation.delete({ where: { id: reservationId } });
  return NextResponse.json({ success: true });
}
