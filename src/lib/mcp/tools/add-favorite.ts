import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { addFavorite } from "@/lib/db/queries/user-data";

export function registerAddFavorite(server: McpServer, userId: string) {
  server.registerTool(
    "add_favorite",
    {
      description: "Add a scenic spot or route to the user's personal favorites list.",
      inputSchema: {
        type: z.enum(["spot", "route"]).describe("Whether to favorite a spot or a route"),
        id: z.number().int().positive().describe("The numeric ID of the spot or route to favorite"),
      },
    },
    async ({ type, id }) => {
      try {
        if (!userId || userId === "anonymous") {
          return {
            content: [{ type: "text", text: JSON.stringify({ success: false, error: "User must be logged in to save favorites." }) }],
          };
        }
        const favorite = await addFavorite(userId, type, id);
        return {
          content: [{ type: "text", text: JSON.stringify({ success: true, favorite }) }],
        };
      } catch (err: any) {
        return {
          content: [{ type: "text", text: JSON.stringify({ success: false, error: err.message }) }],
        };
      }
    }
  );
}
