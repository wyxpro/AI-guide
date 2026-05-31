import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getVisitRecordsByUser, createVisitRecord } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const result = requireAuth(request);
  if (!result.ok) return result.response;
  const { id: userId } = result.user;

  try {
    const records = await getVisitRecordsByUser(userId);
    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch visit records" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const result = requireAuth(request);
  if (!result.ok) return result.response;
  const { id: userId } = result.user;

  try {
    const { type, id } = await request.json();
    const record = await createVisitRecord(userId, type, Number(id));
    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create visit record" }, { status: 500 });
  }
}
