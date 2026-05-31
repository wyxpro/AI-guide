import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerListSpots } from "./tools/list-spots";
import { registerListRoutes } from "./tools/list-routes";
import { registerGetSpot } from "./tools/get-spot";
import { registerAskQuestion } from "./tools/ask-question";

export function buildMcpServer(userId: string): McpServer {
  const server = new McpServer({
    name: "cuiyu-ai-guide",
    version: "1.0.0",
  });

  registerListSpots(server, userId);
  registerListRoutes(server, userId);
  registerGetSpot(server, userId);
  registerAskQuestion(server, userId);

  return server;
}
