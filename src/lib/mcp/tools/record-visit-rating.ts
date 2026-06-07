import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createVisitRecord, rateVisitRecord, getVisitRecordsByUser } from "@/lib/db/queries/user-data";

export function registerRecordVisitRating(server: McpServer, userId: string) {
  server.registerTool(
    "record_visit_rating",
    {
      description: "Record a visit to a scenic spot or route, optionally including a rating (1-5 stars) and personal notes.",
      inputSchema: {
        type: z.enum(["spot", "route"]).describe("Whether this visit is for a spot or a route"),
        id: z.number().int().positive().describe("The numeric ID of the spot or route visited"),
        rating: z.number().int().min(1).max(5).optional().describe("User rating from 1 to 5 stars (optional)"),
        notes: z.string().max(500).optional().describe("Optional personal notes about the visit"),
      },
    },
    async ({ type, id, rating, notes }) => {
      try {
        if (!userId || userId === "anonymous") {
          return {
            content: [{ type: "text", text: JSON.stringify({ success: false, error: "User must be logged in to record visits." }) }],
          };
        }

        // Create a new visit record
        const visitRecord = await createVisitRecord(userId, type, id);

        // Apply rating if provided
        let finalRecord = visitRecord;
        if (rating && visitRecord?.id) {
          finalRecord = await rateVisitRecord(visitRecord.id, userId, rating, notes);
        }

        return {
          content: [{ type: "text", text: JSON.stringify({ success: true, visitRecord: finalRecord }) }],
        };
      } catch (err: any) {
        return {
          content: [{ type: "text", text: JSON.stringify({ success: false, error: err.message }) }],
        };
      }
    }
  );
}
