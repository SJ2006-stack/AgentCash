import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Read env from the Cloudflare Worker/Pages `env` binding first, then `process.env`.
 * Dashboard and wrangler vars live on `env`; Next.js often inlines `process.env.NEXT_PUBLIC_*`
 * at build time (empty in CI), so `process.env` alone misses runtime Cloudflare configuration.
 */
export function readWorkerEnv(key: string): string | undefined {
  try {
    const { env } = getCloudflareContext();
    const v = env[key as keyof typeof env];
    if (typeof v === "string") return v;
  } catch {
    /* SSG, `next build`, tests, or `next dev` without worker context */
  }
  const fromProcess = process.env[key];
  return typeof fromProcess === "string" ? fromProcess : undefined;
}

export function readWorkerEnvFlag(key: string): boolean {
  const v = readWorkerEnv(key);
  return v === "1" || v === "true";
}
