import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
});

async function authorize(dayId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const day = await prisma.itineraryDay.findFirst({
    where: { id: dayId },
    include: { trip: true },
  });

  if (!day || day.trip.userId !== session.user.id) {
    return {
      error: NextResponse.json({ error: "Not found" }, { status: 404 }),
    };
  }

  return { error: null };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ dayId: string; itemId: string }> },
) {
  const { dayId, itemId } = await params;

  const auth = await authorize(dayId);
  if (auth.error) return auth.error;

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const item = await prisma.itineraryItem.findFirst({
    where: { id: itemId, dayId },
  });

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.itineraryItem.update({
    where: { id: itemId },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ dayId: string; itemId: string }> },
) {
  const { dayId, itemId } = await params;

  const auth = await authorize(dayId);
  if (auth.error) return auth.error;

  const item = await prisma.itineraryItem.findFirst({
    where: { id: itemId, dayId },
  });

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.itineraryItem.delete({ where: { id: itemId } });

  return NextResponse.json({ ok: true });
}
