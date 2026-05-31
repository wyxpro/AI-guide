import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { removeFavoriteById } from "@/lib/db/queries/user-data";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = requireAuth(_);
  if (!result.ok) return result.response;
  const { id: userId } = result.user;

  try {
    const { id } = await params;
    await removeFavoriteById(Number(id), userId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 });
  }
}
