import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAllAvatarConfigs, updateAvatarConfig, createAvatarConfig } from "@/lib/db/queries";

async function checkAdmin(request: NextRequest) {
  const result = await requireAdmin(request);
  if (!result.ok) return { ok: false as const, response: result.response };
  return { ok: true as const, user: result.user };
}

export async function GET(request: NextRequest) {
  const auth = await checkAdmin(request);
  if (!auth.ok) return auth.response;
  try {
    const configs = await getAllAvatarConfigs();
    return NextResponse.json(configs);
  } catch {
    return NextResponse.json({ error: "Failed to fetch avatar configs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await checkAdmin(request);
  if (!auth.ok) return auth.response;
  try {
    const body = await request.json();
    const config = await createAvatarConfig(body);
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ error: "Failed to create avatar config" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await checkAdmin(request);
  if (!auth.ok) return auth.response;
  try {
    const { id, ...data } = await request.json();
    const config = await updateAvatarConfig(id, data);
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ error: "Failed to update avatar config" }, { status: 500 });
  }
}
