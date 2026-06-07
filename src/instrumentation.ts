/**
 * Next.js Instrumentation Hook
 * Runs ONCE before any server-side code in every Serverless Function worker.
 * This ensures env vars are available at runtime even when Vercel environment
 * variables are not explicitly configured in the dashboard.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Provide runtime fallbacks so @eazo/sdk and DB clients never crash on missing env
  process.env.EAZO_APP_ID = process.env.EAZO_APP_ID || "iD3DfwgriXjTxeE6";
  process.env.NEXT_PUBLIC_EAZO_APP_ID = process.env.NEXT_PUBLIC_EAZO_APP_ID || "iD3DfwgriXjTxeE6";
  process.env.EAZO_PLATFORM_API_BASE = process.env.EAZO_PLATFORM_API_BASE || "https://eazo.ai";
  process.env.EAZO_PRIVATE_KEY =
    process.env.EAZO_PRIVATE_KEY ||
    "a415360376002fab9f1c9d7bcf6ce25b0cb46ec2e6cb510e2df0d0b132db9ce5";
  process.env.DATABASE_URL =
    process.env.DATABASE_URL ||
    "postgresql://eazo-v4c7v3sv:MP5DAPufPL5IPouJR5S72E7e@managed-database-3.eazo.ai:5432/cuiyu-ai-guide-f7p4r3ca";
}
