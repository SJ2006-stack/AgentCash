import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

initOpenNextCloudflareForDev();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Framer Motion entrance animations can cancel on Strict Mode's dev double-mount.
  reactStrictMode: false,
  outputFileTracingRoot: path.join(__dirname, "../.."),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatar.vercel.sh",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
