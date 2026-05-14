"use client";

import { useState } from "react";

export function McpKeyButton({ agentId }: { agentId: string }) {
  const [loading, setLoading] = useState(false);
  const [shown, setShown] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setShown(null);
    try {
      const res = await fetch(`/api/agents/${agentId}/mcp-key`, { method: "POST" });
      const j = (await res.json()) as { api_key?: string; error?: string; warning?: string };
      if (!res.ok) throw new Error(j.error ?? "failed");
      setShown(j.api_key ?? "");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to generate key");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ac-card p-5">
      <h2 className="text-sm font-semibold text-[color:var(--fg)]">MCP credentials</h2>
      <p className="mt-2 text-xs leading-relaxed text-[color:var(--muted)]">
        Put <code className="text-emerald-300/90">MCP_AGENT_ID</code> and <code className="text-emerald-300/90">MCP_AGENT_KEY</code>{" "}
        in your MCP server environment. Keys are hashed at rest; you only see the secret once.
      </p>
      <p className="mt-3 text-xs text-[color:var(--muted)]">
        Agent id: <code className="text-[color:var(--fg)]">{agentId}</code>
      </p>
      <button
        type="button"
        onClick={() => void generate()}
        disabled={loading}
        className="ac-btn-secondary mt-4 px-4 py-2.5 text-sm disabled:opacity-50"
      >
        {loading ? "Generating…" : "Generate new MCP key"}
      </button>
      {shown ? (
        <pre className="mt-4 overflow-x-auto rounded-lg border border-emerald-500/20 bg-black/50 p-4 text-xs text-emerald-300/95">
          {shown}
        </pre>
      ) : null}
    </div>
  );
}
