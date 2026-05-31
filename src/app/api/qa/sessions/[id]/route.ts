import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { updateChatSession, deleteChatSession, getChatSessionById } from "@/lib/db/queries/user-data";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = requireAuth(request);
  if (!result.ok) return result.response;
  const { id: userId } = result.user;
  try {
    const { id } = await params;
    const { messages } = await request.json();
    const session = await updateChatSession(Number(id), messages);
    return NextResponse.json(session);
  } catch {
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = requireAuth(request);
  if (!result.ok) return result.response;
  const { id: userId } = result.user;
  try {
    const { id } = await params;
    await deleteChatSession(Number(id), userId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
