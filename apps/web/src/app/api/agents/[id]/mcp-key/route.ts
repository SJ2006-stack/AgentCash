import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: agentId } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

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
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({
    api_key: plain,
    warning: "Store this MCP agent key in your runtime env (MCP_AGENT_KEY). It is shown once.",
  });
}
