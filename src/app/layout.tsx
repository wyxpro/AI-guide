import type { Metadata, Viewport } from "next";
import "./globals.css";
import { EazoProvider } from "@eazo/sdk/react";
import { Toaster } from "@/components/ui/sonner";
import { UserSyncEffect } from "@/components/user-profile/user-sync-effect";
import { LayoutShell } from "@/components/layout/LayoutShell";

import Script from "next/script";

const SITE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : undefined;

export const metadata: Metadata = {
  ...(SITE_URL ? { metadataBase: new URL(SITE_URL) } : {}),
  title: "旅行家Pro·智慧景区导游",
  description: "旅行家Pro智慧景区导游系统，7×24小时在线个性化游览服务。支持语音问答、路线规划、景点讲解。",
  manifest: "/manifest.json",
  icons: {
    icon: "/image/logo.png",
    shortcut: "/image/logo.png",
    apple: "/image/logo.png",
  },
  openGraph: {
    type: "website",
    siteName: "旅行家Pro",
    title: "旅行家Pro·智慧景区导游",
    description: "AI数字人导览，让每个景点都有故事可听。",
    locale: "zh_CN",
  },
  twitter: {
    card: 'summary_large_image',
    title: "旅行家Pro",
    description: "旅行家Pro是一款面向景区游客与管理方的双端智能导览系统。游客端提供数字人形象展示与互动、语音/文字智能问答、个性化路线规划、景点详情讲解，以及个人游览记录管理；管理端提供实时数据大屏、知识库文件上传与分类管理、数字人外观与音色配置、以及游客行为数据可视化分析。支持适老化与童趣模式切换，移动端网页...",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-svh" style={{ fontFamily: "var(--font-noto-sans)", background: "#FAF8F5" }}>
        <EazoProvider>
          <UserSyncEffect />
          <Script src="/sentio/core/live2dcubismcore.min.js" strategy="beforeInteractive" />
          <LayoutShell>{children}</LayoutShell>
          <Toaster position="top-center" />
        </EazoProvider>
        <Script id="register-sw" dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.port) {
                navigator.serviceWorker.getRegistrations().then((registrations) => {
                  for (let registration of registrations) {
                    registration.unregister();
                  }
                });
              } else {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            }
          `,
        }} />
      </body>
    </html>
  );
}
