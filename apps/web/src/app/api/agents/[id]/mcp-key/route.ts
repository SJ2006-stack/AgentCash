import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { toErrorResponse } from "@/lib/api/http-errors";
import { checkRateLimit, mcpKeyRotateMaxPerHour } from "@/lib/api/rate-limit";
import { createClient } from "@/lib/supabase/server";

const ROTATE_WINDOW_MS = 3_600_000;

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id: agentId } = await ctx.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const cap = mcpKeyRotateMaxPerHour();
    const rl = checkRateLimit(`mcp-key-rotate:${user.id}`, cap, ROTATE_WINDOW_MS);
    if (!rl.ok) {
      return NextResponse.json(
        {
          error: "rate_limited",
          message: "Too many new MCP keys for this account this hour. Wait before rotating again.",
        },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
      );
    }

    const { data: agent } = await supabase.from("agents").select("id").eq("id", agentId).eq("user_id", user.id).single();
    if (!agent) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const plain = `mcp_${randomBytes(24).toString("hex")}`;
    const secret_hash = createHash("sha256").update(plain, "utf8").digest("hex");
    const key_prefix = plain.slice(0, 10);

    const { error } = await supabase.from("agent_mcp_keys").insert({
      agent_id: agentId,
      key_prefix,
      secret_hash,
    });
    if (error) {
      return NextResponse.json(
        { error: "key_rotate_failed", message: "Could not store the new key. Check permissions or try again." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      api_key: plain,
      warning: "Store this MCP agent key in your runtime env (MCP_AGENT_KEY). It is shown once.",
    });
  } catch (e) {
    return toErrorResponse(e);
  }
}
