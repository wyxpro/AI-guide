import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAllKnowledgeDocs, createKnowledgeDoc, updateKnowledgeDoc, deleteKnowledgeDoc } from "@/lib/db/queries";

async function checkAdmin(request: NextRequest) {
  const result = await requireAdmin(request);
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
  const auth = await checkAdmin(request);
  if (!auth.ok) return auth.response;
  try {
    const body = await request.json();
    const doc = await createKnowledgeDoc(body);
    if (doc) {
      triggerAsyncVectorization(doc.id).catch(() => {});
    }
    return NextResponse.json(doc);
  } catch {
    return NextResponse.json({ error: "Failed to create doc" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await checkAdmin(request);
  if (!auth.ok) return auth.response;
  try {
    const { id, ...data } = await request.json();
    const doc = await updateKnowledgeDoc(id, data);
    if (doc) {
      triggerAsyncVectorization(doc.id).catch(() => {});
    }
    return NextResponse.json(doc);
  } catch {
    return NextResponse.json({ error: "Failed to update doc" }, { status: 500 });
  }
}

import { db } from "@/lib/db/client";
import { knowledgeDocs } from "@/lib/db/schema/admin";
import { eq } from "drizzle-orm";
import { getEmbedding } from "@/lib/api/embedding";

async function triggerAsyncVectorization(docId: number) {
  // Simulate vector embedding generation asynchronously in background
  setTimeout(async () => {
    try {
      const doc = await db.select().from(knowledgeDocs).where(eq(knowledgeDocs.id, docId)).limit(1);
      if (doc[0]) {
        const textToEmbed = `${doc[0].title} ${doc[0].content}`;
        const vec = await getEmbedding(textToEmbed);
        await db
          .update(knowledgeDocs)
          .set({ vectorized: true, embedding: vec, updatedAt: new Date() })
          .where(eq(knowledgeDocs.id, docId));
        console.log(`[Vectorization] Document ${docId} successfully vectorized with embedding.`);
      }
    } catch (e) {
      console.error(`[Vectorization] Failed to vectorize document ${docId}`, e);
    }
  }, 1000);
}

export async function DELETE(request: NextRequest) {
  const auth = await checkAdmin(request);
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
