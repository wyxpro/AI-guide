import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { spots } from "@/lib/db/schema/spots";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  try {
    const body = await request.json();
    const rows = await db.update(spots).set({ ...body, updatedAt: new Date() })
      .where(eq(spots.id, Number(id))).returning();
    return NextResponse.json(rows[0]);
  } catch {
    return NextResponse.json({ error: "Failed to update spot" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  try {
    await db.delete(spots).where(eq(spots.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete spot" }, { status: 500 });
  }
}
