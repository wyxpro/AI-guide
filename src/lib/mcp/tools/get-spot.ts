import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getSpotById } from "@/lib/db/queries/spots";
import { z } from "zod";

export function registerGetSpot(server: McpServer, _userId: string) {
  server.registerTool(
    "get_spot",
    {
      description: "Get detailed information about a specific scenic spot by ID.",
      inputSchema: {
        id: z.number().int().positive().describe("The spot ID"),
      },
    },
    async ({ id }) => {
      const spot = await getSpotById(id);
      if (!spot) {
        return { isError: true, content: [{ type: "text", text: `Spot ${id} not found.` }] };
      }
      return {
        content: [{ type: "text", text: JSON.stringify(spot, null, 2) }],
      };
    }
  );
}
