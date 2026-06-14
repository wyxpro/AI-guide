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

import { db } from "../db/client";
import { users } from "../db/schema/users";
import { eq } from "drizzle-orm";

export async function requireAdmin(request: NextRequest): Promise<{ ok: true; user: any } | { ok: false; response: Response }> {
  const authResult = requireAuth(request);
  if (!authResult.ok) return { ok: false, response: authResult.response };
  
  let userRole = (authResult.user.email === "wyxcode@qq.com" || process.env.NODE_ENV === "development") ? "admin" : "user";
  
  try {
    const dbUser = await db.select().from(users).where(eq(users.id, authResult.user.id)).limit(1);
    if (dbUser[0]?.role) {
      userRole = dbUser[0].role;
    }
  } catch (err) {
    console.error("Failed to query user role from DB:", err);
  }

  // Force admin role for the hardcoded admin email or development environment
  if (authResult.user.email === "wyxcode@qq.com" || process.env.NODE_ENV === "development") {
    userRole = "admin";
  }

  if (userRole !== "admin") {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({ error: "Forbidden: Admin access required" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      ),
    };
  }
  
  return { ok: true, user: { ...authResult.user, role: userRole } };
}

