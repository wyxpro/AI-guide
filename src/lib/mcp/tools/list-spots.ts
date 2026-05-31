import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getAllSpots, getSpotsByCategory } from "@/lib/db/queries/spots";
import { z } from "zod";

export function registerListSpots(server: McpServer, _userId: string) {
  server.registerTool(
    "list_spots",
    {
      description: "List all scenic spots in the park. Optionally filter by category.",
      inputSchema: {
        category: z.enum(["cultural", "nature", "history", "family"]).optional().describe("Filter by category"),
      },
    },
    async ({ category }) => {
      const spots = category ? await getSpotsByCategory(category) : await getAllSpots();
      return {
        content: [{ type: "text", text: JSON.stringify(spots, null, 2) }],
      };
    }
  );
}
