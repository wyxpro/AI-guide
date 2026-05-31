import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const demoTargets = [
  "src/components/todo-list",
  "src/app/api/todos",
  "src/lib/api/todos.ts",
  "src/lib/db/schema/todos.ts",
  "src/lib/db/queries/todos.ts",
  "src/lib/db/migrations",
  "src/lib/mcp/tools",
];

const exportCleanupFiles = [
  "src/lib/api/index.ts",
  "src/lib/db/queries/index.ts",
  "src/lib/db/schema/index.ts",
];

const CLEAN_MCP_SERVER = `import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function buildMcpServer(_userId: string): McpServer {
  const server = new McpServer({
    name: "eazo-mcp",
    version: "1.0.0",
  });

  // Register your tools here. See AGENTS.md \xA7 8 for the pattern:
  //   import { registerMyTool } from "./tools/my-tool";
  //   registerMyTool(server, _userId);

  return server;
}
`;

const CLEAN_HOME_PAGE = `import { UserBadge } from "@/components/user-profile/user-badge";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background">
      <header className="absolute right-4 top-4 z-10">
        <UserBadge />
      </header>
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="max-w-xl text-center space-y-3">
          <h1 className="text-2xl font-semibold">Eazo App Template</h1>
          <p className="text-sm text-muted-foreground">
            Replace this page with your product UI. See AGENTS.md for guidance.
          </p>
        </div>
      </main>
    </div>
  );
}
`;

const CLEAN_NOTIFICATIONS_TEST_ROUTE = `import { type NextRequest, NextResponse } from "next/server";
import { notifications, EazoNotificationPublishError } from "@eazo/sdk/server";
import { requireAuth } from "@/lib/auth";

/**
 * Sends a test push to every subscriber of this app. The template ships a
 * static message so the route works immediately after \`bun run cleanup:demo\`.
 * Customize \`title\` / \`body\` / \`data\` for your product.
 */
export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.ok) return auth.response;

  const callerLabel =
    auth.user.name?.trim() || auth.user.email?.split("@")[0] || "there";

  try {
    const result = await notifications.publish({
      title: \`Hello, \${callerLabel} 👋\`,
      body: "This is a test notification from your Eazo app.",
      data: {
        source: "test-button",
        triggeredByUserId: auth.user.id,
      },
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof EazoNotificationPublishError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.code >= 400 && err.code < 600 ? err.code : 500 },
      );
    }
    console.error("[notifications/test] unexpected error", err);
    return NextResponse.json({ error: "publish failed" }, { status: 500 });
  }
}
`;

const fileRewrites: Array<{ relPath: string; contents: string }> = [
  { relPath: "src/lib/mcp/server.ts", contents: CLEAN_MCP_SERVER },
  { relPath: "src/app/page.tsx", contents: CLEAN_HOME_PAGE },
  {
    relPath: "src/app/api/notifications/test/route.ts",
    contents: CLEAN_NOTIFICATIONS_TEST_ROUTE,
  },
];

function resolveFromRoot(relPath: string): string {
  return path.join(ROOT, relPath);
}

function removePath(relPath: string) {
  const absPath = resolveFromRoot(relPath);
  if (!existsSync(absPath)) {
    console.log(`- skip (not found): ${relPath}`);
    return;
  }

  rmSync(absPath, { recursive: true, force: true });
  console.log(`- removed: ${relPath}`);
}

function cleanupTodosExport(relPath: string) {
  const absPath = resolveFromRoot(relPath);
  if (!existsSync(absPath)) {
    console.log(`- skip export cleanup (not found): ${relPath}`);
    return;
  }

  const original = readFileSync(absPath, "utf8");
  const next = original
    .split("\n")
    .filter((line) => !/^\s*export\s+\*\s+from\s+["']\.\/todos["'];?\s*$/.test(line))
    .join("\n")
    .trimEnd();

  const finalContent = next.length > 0 ? `${next}\n` : "";
  if (finalContent !== original) {
    writeFileSync(absPath, finalContent, "utf8");
    console.log(`- cleaned exports: ${relPath}`);
  } else {
    console.log(`- no export changes: ${relPath}`);
  }
}

function rewriteFile({ relPath, contents }: { relPath: string; contents: string }) {
  const absPath = resolveFromRoot(relPath);
  if (!existsSync(absPath)) {
    console.log(`- skip rewrite (not found): ${relPath}`);
    return;
  }

  const original = readFileSync(absPath, "utf8");
  if (original === contents) {
    console.log(`- already clean: ${relPath}`);
    return;
  }

  writeFileSync(absPath, contents, "utf8");
  console.log(`- rewrote: ${relPath}`);
}

function main() {
  console.log("Cleaning template demo artifacts...");
  demoTargets.forEach(removePath);

  console.log("Fixing stale index exports...");
  exportCleanupFiles.forEach(cleanupTodosExport);

  console.log("Rewriting files that referenced demo modules...");
  fileRewrites.forEach(rewriteFile);

  console.log("Done. Demo cleanup completed.");
}

main();
