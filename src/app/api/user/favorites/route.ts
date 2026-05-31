import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getFavoritesByUser, addFavorite } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const result = requireAuth(request);
  if (!result.ok) return result.response;
  const { id: userId } = result.user;

  try {
    const favs = await getFavoritesByUser(userId);
    return NextResponse.json(favs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const result = requireAuth(request);
  if (!result.ok) return result.response;
  const { id: userId } = result.user;

  try {
    const { type, id } = await request.json();
    const fav = await addFavorite(userId, type, Number(id));
    return NextResponse.json(fav);
  } catch (error) {
    return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 });
  }
}
