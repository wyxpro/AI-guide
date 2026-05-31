import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getAllKnowledgeDocs, createKnowledgeDoc, updateKnowledgeDoc, deleteKnowledgeDoc } from "@/lib/db/queries";

function checkAdmin(request: NextRequest) {
  const result = requireAuth(request);
  if (!result.ok) return { ok: false as const, response: result.response };
  return { ok: true as const, user: result.user };
}

export async function GET(request: NextRequest) {
  // Knowledge read is public for QA context; skip auth
  try {
    const docs = await getAllKnowledgeDocs();
    return NextResponse.json(docs);
  } catch {
    return NextResponse.json({ error: "Failed to fetch docs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = checkAdmin(request);
  if (!auth.ok) return auth.response;
  try {
    const body = await request.json();
    const doc = await createKnowledgeDoc(body);
    return NextResponse.json(doc);
  } catch {
    return NextResponse.json({ error: "Failed to create doc" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = checkAdmin(request);
  if (!auth.ok) return auth.response;
  try {
    const { id, ...data } = await request.json();
    const doc = await updateKnowledgeDoc(id, data);
    return NextResponse.json(doc);
  } catch {
    return NextResponse.json({ error: "Failed to update doc" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = checkAdmin(request);
  if (!auth.ok) return auth.response;
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    await deleteKnowledgeDoc(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete doc" }, { status: 500 });
  }
}
