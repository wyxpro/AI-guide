import type { NextConfig } from "next";

// Inject environment variables at build-time for prerendering and compiling
process.env.EAZO_APP_ID = process.env.EAZO_APP_ID || "iD3DfwgriXjTxeE6";
process.env.NEXT_PUBLIC_EAZO_APP_ID = process.env.NEXT_PUBLIC_EAZO_APP_ID || "iD3DfwgriXjTxeE6";
process.env.EAZO_PLATFORM_API_BASE = process.env.EAZO_PLATFORM_API_BASE || "https://eazo.ai";
process.env.EAZO_PRIVATE_KEY = process.env.EAZO_PRIVATE_KEY || "a415360376002fab9f1c9d7bcf6ce25b0cb46ec2e6cb510e2df0d0b132db9ce5";
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://eazo-v4c7v3sv:MP5DAPufPL5IPouJR5S72E7e@managed-database-3.eazo.ai:5432/cuiyu-ai-guide-f7p4r3ca";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Pull the local `@eazo/sdk` (hard-copied into node_modules by
  // `bun run sdk:sync`) into Next's watch + transpile graph. Without
  // this, changes inside `node_modules/@eazo/sdk/dist/` don't trigger
  // HMR — the `bun run sdk:watch` workflow would still require a manual
  // `next dev` restart on every SDK edit. With this flag, Turbopack
  // re-bundles + the browser refreshes automatically.
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
    "172.31.*.*",
  ],
};

export default nextConfig;
