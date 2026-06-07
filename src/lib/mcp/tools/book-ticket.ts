import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { spots } from "@/lib/db/schema/spots";
import { eq } from "drizzle-orm";

// Ticket pricing table (could come from DB in production)
const TICKET_PRICES: Record<string, number> = {
  adult: 80,
  child: 40,
  elder: 40,
  student: 50,
};

export function registerBookTicket(server: McpServer, userId: string) {
  server.registerTool(
    "book_ticket",
    {
      description: "Simulate booking an entrance ticket for a scenic spot or park zone. Returns a booking confirmation with pricing details.",
      inputSchema: {
        spotId: z.number().int().positive().optional().describe("Optional specific spot ID to book a zone ticket for"),
        ticketType: z.enum(["adult", "child", "elder", "student"]).default("adult").describe("Ticket type: adult, child (under 12), elder (over 65), or student"),
        quantity: z.number().int().min(1).max(10).default(1).describe("Number of tickets (1-10)"),
        visitDate: z.string().optional().describe("Planned visit date in YYYY-MM-DD format (defaults to today)"),
      },
    },
    async ({ spotId, ticketType, quantity, visitDate }) => {
      try {
        if (!userId || userId === "anonymous") {
          return {
            content: [{ type: "text", text: JSON.stringify({ success: false, error: "User must be logged in to book tickets." }) }],
          };
        }

        // Get spot info if provided
        let spotName = "翠玉景区（通票）";
        if (spotId) {
          const spotRows = await db.select().from(spots).where(eq(spots.id, spotId)).limit(1);
          if (spotRows[0]) {
            spotName = spotRows[0].name;
          }
        }

        const pricePerTicket = TICKET_PRICES[ticketType] ?? 80;
        const totalPrice = pricePerTicket * quantity;
        const date = visitDate ?? new Date().toISOString().slice(0, 10);

        // Generate mock booking reference
        const bookingRef = `TY${Date.now().toString(36).toUpperCase().slice(-8)}`;

        const booking = {
          success: true,
          bookingRef,
          spotName,
          ticketType,
          quantity,
          pricePerTicket,
          totalPrice,
          visitDate: date,
          userId,
          message: `✅ 预订成功！您已为 ${quantity} 位${ticketType === "adult" ? "成人" : ticketType === "child" ? "儿童" : ticketType === "elder" ? "老人" : "学生"}预订了「${spotName}」的门票。`,
          instructions: "请在游览当日携带本预订码至景区服务中心换取实体票，或使用景区APP扫码入园。",
        };

        return {
          content: [{ type: "text", text: JSON.stringify(booking, null, 2) }],
        };
      } catch (err: any) {
        return {
          content: [{ type: "text", text: JSON.stringify({ success: false, error: err.message }) }],
        };
      }
    }
  );
}
