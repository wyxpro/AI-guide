import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getChatSessionsByUser, createChatSession } from "@/lib/db/queries/user-data";

export async function GET(request: NextRequest) {
  const result = requireAuth(request);
  if (!result.ok) return result.response;
  const { id: userId } = result.user;
  try {
    const sessions = await getChatSessionsByUser(userId);
    return NextResponse.json(sessions);
  } catch {
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const result = requireAuth(request);
  if (!result.ok) return result.response;
  const { id: userId } = result.user;
  try {
    const { title } = await request.json();
    const session = await createChatSession(userId, title || "导览对话");
    return NextResponse.json(session);
  } catch {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
