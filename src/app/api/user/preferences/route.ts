import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getUserPreferences, upsertUserPreferences } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const result = requireAuth(request);
  if (!result.ok) return result.response;
  const { id: userId } = result.user;

  try {
    const prefs = await getUserPreferences(userId);
    return NextResponse.json(prefs ?? { interests: [], preferredDuration: 120, accessibilityMode: "normal" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const result = requireAuth(request);
  if (!result.ok) return result.response;
  const { id: userId } = result.user;

  try {
    const body = await request.json();
    const prefs = await upsertUserPreferences(userId, body);
    return NextResponse.json(prefs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
  }
}
