import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerListSpots } from "./tools/list-spots";
import { registerListRoutes } from "./tools/list-routes";
import { registerGetSpot } from "./tools/get-spot";
import { registerAskQuestion } from "./tools/ask-question";
import { registerAddFavorite } from "./tools/add-favorite";
import { registerRecordVisitRating } from "./tools/record-visit-rating";
import { registerBookTicket } from "./tools/book-ticket";

export function buildMcpServer(userId: string): McpServer {
  const server = new McpServer({
    name: "cuiyu-ai-guide",
    version: "1.0.0",
  });

  // Read-only tools
  registerListSpots(server, userId);
  registerListRoutes(server, userId);
  registerGetSpot(server, userId);
  registerAskQuestion(server, userId);

  // Write-operation tools (Agent state mutation)
  registerAddFavorite(server, userId);
  registerRecordVisitRating(server, userId);
  registerBookTicket(server, userId);

  return server;
}
