import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

initOpenNextCloudflareForDev();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  transpilePackages: ["@mandate/mandate-engine"],
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

export default nextConfig;
