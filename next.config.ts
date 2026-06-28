import type { NextConfig } from "next";

// ── Build-time env injection ────────────────────────────────────────────────
// These mutations run when `next build` executes next.config.ts, making the
// values available during prerendering (SSG worker processes).
// For RUNTIME (Vercel Serverless Functions), the fallbacks are also set in
// src/instrumentation.ts which Next.js runs before any server handler.
const ENV_DEFAULTS: Record<string, string> = {
  EAZO_APP_ID: "iD3DfwgriXjTxeE6",
  NEXT_PUBLIC_EAZO_APP_ID: "iD3DfwgriXjTxeE6",
  EAZO_PLATFORM_API_BASE: "https://eazo.ai",
  EAZO_PRIVATE_KEY:
    "a415360376002fab9f1c9d7bcf6ce25b0cb46ec2e6cb510e2df0d0b132db9ce5",
  DATABASE_URL:
    "postgresql://eazo-v4c7v3sv:MP5DAPufPL5IPouJR5S72E7e@managed-database-3.eazo.ai:5432/cuiyu-ai-guide-f7p4r3ca",
};
for (const [k, v] of Object.entries(ENV_DEFAULTS)) {
  if (!process.env[k]) process.env[k] = v;
}

const nextConfig: NextConfig = {
  // Embed env vars into the compiled server bundle so they survive the
  // Vercel cold-start without needing the dashboard env vars configured.
  env: {
    EAZO_APP_ID: process.env.EAZO_APP_ID!,
    NEXT_PUBLIC_EAZO_APP_ID: process.env.NEXT_PUBLIC_EAZO_APP_ID!,
    EAZO_PLATFORM_API_BASE: process.env.EAZO_PLATFORM_API_BASE!,
    EAZO_PRIVATE_KEY: process.env.EAZO_PRIVATE_KEY!,
    DATABASE_URL: process.env.DATABASE_URL!,
  },
  images: {
    unoptimized: true,
  },
  // Pull the local `@eazo/sdk` into Next's transpile graph.
  transpilePackages: ["@eazo/sdk"],
  // RFC1918 LAN ranges + localhost for `next dev` HMR over Wi-Fi.
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.*.*",
    "10.*.*.*",
    "172.16.*.*",
    "172.17.*.*",
    "172.18.*.*",
    "172.19.*.*",
    "172.20.*.*",
    "172.21.*.*",
    "172.22.*.*",
    "172.23.*.*",
    "172.24.*.*",
    "172.25.*.*",
    "172.26.*.*",
    "172.27.*.*",
    "172.28.*.*",
    "172.29.*.*",
    "172.30.*.*",
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
