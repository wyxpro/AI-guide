import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "@/lib/db/client";
import { knowledgeDocs } from "@/lib/db/schema/admin";
import { ai } from "@eazo/sdk";
import { stepChat } from "@/lib/api/stepfun";
import { z } from "zod";

export function registerAskQuestion(server: McpServer, _userId: string) {
  server.registerTool(
    "ask_question",
    {
      description: "Ask a question about the park. The AI will answer using knowledge base context.",
      inputSchema: {
        question: z.string().min(1).describe("The question to ask"),
      },
    },
    async ({ question }) => {
      const allDocs = await db.select({ title: knowledgeDocs.title, category: knowledgeDocs.category, content: knowledgeDocs.content }).from(knowledgeDocs).limit(10);
      const context = allDocs.map((d) => `[${d.category}] ${d.title}: ${d.content}`).join("\n\n");
      const systemPrompt = `你是翠玉景区的专属AI导览员小玉，基于以下知识库回答问题：\n\n${context}\n\n请用温暖亲切的语气回答，200字以内。`;

      const response = await stepChat({
        model: "step-3.7-flash",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: question }],
        max_tokens: 500,
      });

      const answer = response.choices?.[0]?.message?.content ?? "抱歉，暂时无法回答这个问题。";
      return { content: [{ type: "text", text: answer }] };
    }
  );
}
