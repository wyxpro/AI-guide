import OpenAI from "openai";

function getDeterministicEmbedding(text: string): number[] {
  const embedding = new Array(1536).fill(0);
  const clean = text.toLowerCase().replace(/\s+/g, "");
  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    // Use stable pseudo-random mapping based on character codes
    const index = Math.abs(Math.sin(code + i)) * 1536;
    const pos = Math.floor(index) % 1536;
    const val = Math.cos(code + i);
    embedding[pos] += val;
  }
  // Normalize vector
  let sumSq = 0;
  for (let i = 0; i < 1536; i++) {
    sumSq += embedding[i] * embedding[i];
  }
  const magnitude = Math.sqrt(sumSq) || 1;
  for (let i = 0; i < 1536; i++) {
    embedding[i] = embedding[i] / magnitude;
  }
  return embedding;
}

export async function getEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.EAZO_PRIVATE_KEY;
  const baseURL = `${process.env.EAZO_PLATFORM_API_BASE || "https://eazo.ai"}/v1`;

  if (!apiKey || !text) {
    return getDeterministicEmbedding(text);
  }

  try {
    const openai = new OpenAI({ apiKey, baseURL });
    const res = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return res.data[0].embedding;
  } catch (error) {
    console.warn("[Embedding API error, falling back to local hash]", error);
    return getDeterministicEmbedding(text);
  }
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA.length || !vecB.length || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}
