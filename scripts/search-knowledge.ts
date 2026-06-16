import { db } from "../src/lib/db/client";
import { knowledgeDocs } from "../src/lib/db/schema/admin";

async function main() {
  try {
    const docs = await db.select().from(knowledgeDocs);
    console.log("--- KNOWLEDGE DOCUMENTS ---");
    console.log(`Total: ${docs.length}`);
    for (const doc of docs) {
      console.log(`ID: ${doc.id}`);
      console.log(`Title: ${doc.title}`);
      console.log(`Content: ${doc.content}`);
      console.log("----------------------------");
    }
  } catch (err) {
    console.error("Error querying db:", err);
  }
  process.exit(0);
}

main().catch(console.error);
