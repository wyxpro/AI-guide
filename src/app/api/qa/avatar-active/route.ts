import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { avatarConfigs } from "@/lib/db/schema/admin";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const config = await db.select().from(avatarConfigs).where(eq(avatarConfigs.isDefault, true)).limit(1);
    if (config[0]) {
      return NextResponse.json(config[0]);
    }
    return NextResponse.json({
      avatarStyle: "default",
      voiceStyle: "warm",
      speechRate: 100,
      pitch: 100,
    });
  } catch {
    return NextResponse.json({
      avatarStyle: "default",
      voiceStyle: "warm",
      speechRate: 100,
      pitch: 100,
    });
  }
}
