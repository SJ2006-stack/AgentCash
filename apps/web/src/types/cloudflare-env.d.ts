/// <reference types="@opennextjs/cloudflare" />

declare global {
  interface CloudflareEnv {
    NEXT_PUBLIC_SITE_URL?: string;
  }
}

export {};
