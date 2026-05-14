/// <reference types="@opennextjs/cloudflare" />

declare global {
  interface CloudflareEnv {
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
    NEXT_PUBLIC_SITE_URL?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
    STRIPE_SECRET_KEY?: string;
    STRIPE_SKIP_ISSUING?: string;
    APPROVAL_BASE_URL?: string;
    SLACK_VERIFICATION_TOKEN?: string;
    TWILIO_ACCOUNT_SID?: string;
    TWILIO_AUTH_TOKEN?: string;
    TWILIO_WHATSAPP_FROM?: string;
    AGENT_API_IP_MAX_PER_MIN?: string;
    AGENT_API_READ_LIGHT_PER_MIN?: string;
    AGENT_API_READ_HEAVY_PER_MIN?: string;
    AGENT_API_WRITE_PER_MIN?: string;
    MCP_KEY_ROTATE_MAX_PER_HOUR?: string;
    MANDATE_ALLOW_AGENT_APPROVAL?: string;
  }
}

export {};
