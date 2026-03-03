import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ tripId: string; dayId: string }> },
) {
  const { tripId, dayId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const day = await prisma.itineraryDay.findFirst({
    where: {
      id: dayId,
      tripId,
      trip: { userId: session.user.id },
    },
  });

  if (!day) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.itineraryDay.delete({ where: { id: dayId } });
  return NextResponse.json({ success: true });
}
