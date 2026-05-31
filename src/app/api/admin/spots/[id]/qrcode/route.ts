import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://3000-ii3zrb519qv0v1sppvklf.e2b.app";
    const url = `${baseUrl}/spots/${id}?autoplay=true`;
    const qrData = await QRCode.toDataURL(url, { width: 300, margin: 2 });
    return NextResponse.json({ qrcode: qrData, url });
  } catch {
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
  }
}
