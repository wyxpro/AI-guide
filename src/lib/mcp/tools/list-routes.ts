import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getAllRoutes, getRoutesByInterest } from "@/lib/db/queries/routes";
import { z } from "zod";

export function registerListRoutes(server: McpServer, _userId: string) {
  server.registerTool(
    "list_routes",
    {
      description: "List all available tour routes. Optionally filter by interest type.",
      inputSchema: {
        interest: z.enum(["history", "nature", "cultural", "family"]).optional().describe("Filter by interest"),
      },
    },
    async ({ interest }) => {
      const routes = interest ? await getRoutesByInterest(interest) : await getAllRoutes();
      return {
        content: [{ type: "text", text: JSON.stringify(routes, null, 2) }],
      };
    }
  );
}
