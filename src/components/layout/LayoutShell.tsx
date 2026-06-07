"use client";
import { usePathname } from "next/navigation";
import { BottomTabBar, SidebarNav } from "./Navigation";
import { auth } from "@eazo/sdk";
import { useEazo } from "@eazo/sdk/react";

import { useEffect } from "react";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = useEazo((s: any) => s.auth.user);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loading = useEazo((s: any) => s.auth.loading);

  useEffect(() => {
    const syncMode = () => {
      const mode = localStorage.getItem("accessibility_mode") || "normal";
      document.documentElement.setAttribute("data-accessibility-mode", mode);
    };
    syncMode();
    window.addEventListener("accessibility-mode-change", syncMode);
    return () => window.removeEventListener("accessibility-mode-change", syncMode);
  }, []);

  const isNoShell = pathname === "/welcome" || pathname === "/login";

  if (isNoShell) {
    return <>{children}</>;
  }

  if (isAdmin) {
    if (loading) {
      return (
        <div className="min-h-svh flex items-center justify-center animate-pulse" style={{ background: "#FAF8F5" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black text-white"
            style={{ background: "linear-gradient(135deg,#D2A053,#B8843A)", fontFamily: "var(--font-noto-serif)" }}>
            玉
          </div>
        </div>
      );
    }
    if (!user) {
      return (
        <div className="min-h-svh w-full flex items-center justify-center px-4" style={{ background: "#FAF8F5" }}>
          <div className="w-full max-w-md p-8 rounded-2xl border border-[#E6E2D8] bg-white shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-2xl font-black text-white"
              style={{ background: "linear-gradient(135deg,#D2A053,#B8843A)", fontFamily: "var(--font-noto-serif)", boxShadow: "0 6px 16px rgba(210,160,83,0.25)" }}>
              玉
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-noto-serif)", color: "#1E2522" }}>
                运营管理中心
              </h2>
              <p className="text-xs text-[#8F9F8F]">
                请先登录以访问景区管理、数据大屏及配置项
              </p>
            </div>
            <button
              onClick={() => window.location.href = "/login"}
              className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-98 cursor-pointer"
              style={{ background: "linear-gradient(135deg,#D2A053,#B8843A)" }}
            >
              登录账号
            </button>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex min-h-svh w-full max-w-full overflow-x-hidden">
      {/* PC sidebar — hidden on mobile. */}
      <SidebarNav isAdmin={isAdmin} />

      <main
        className="flex-1 min-h-svh w-full min-w-0"
        style={{
          marginLeft: 0,
        }}
      >
        {!isAdmin && (
          <style>{`
            main { padding-bottom: calc(env(safe-area-inset-bottom) + 56px); }
            @media (min-width: 768px) {
              main { padding-bottom: 0 !important; }
            }
          `}</style>
        )}
        {/* Offset from sidebar on PC */}
        <style>{`
          @media (min-width: 768px) {
            main { margin-left: 240px !important; }
          }
        `}</style>
        {children}
      </main>

      {/* Mobile bottom tab — C端, not admin */}
      {!isAdmin && <BottomTabBar />}
    </div>
  );
}
