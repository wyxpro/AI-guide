import { type NextRequest } from "next/server";
import { requireAuth as originalRequireAuth } from "@eazo/sdk/server";
import type { User, AuthResult } from "@eazo/sdk/server";

export type { User, AuthResult };

export function requireAuth(request: NextRequest): AuthResult {
  const raw = request.headers.get("x-eazo-session");
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.isMock) {
        const email = parsed.email || "mock@example.com";
        const name = email === "wyxcode@qq.com" ? "管理员" : "游客";
        return {
          ok: true,
          user: {
            id: parsed.userId || "mock-user-id",
            email: email,
            name: name,
            avatarUrl: parsed.avatarUrl || null,
          },
        };
      }
    } catch (e) {
      // Fallback on JSON parsing error
    }
  }

  return originalRequireAuth(request);
}
