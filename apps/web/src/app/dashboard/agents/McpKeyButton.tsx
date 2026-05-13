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
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <h2 className="text-sm font-semibold">MCP credentials</h2>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Put <code className="text-[var(--fg)]">MCP_AGENT_ID</code> and <code className="text-[var(--fg)]">MCP_AGENT_KEY</code>{" "}
        in your MCP server environment. Keys are hashed at rest; you only see the secret once.
      </p>
      <p className="mt-2 text-xs text-[var(--muted)]">
        Agent id: <code className="text-[var(--fg)]">{agentId}</code>
      </p>
      <button
        type="button"
        onClick={() => void generate()}
        disabled={loading}
        className="mt-3 rounded-lg border border-[var(--border)] px-3 py-2 text-sm disabled:opacity-50"
      >
        {loading ? "Generating…" : "Generate new MCP key"}
      </button>
      {shown ? (
        <pre className="mt-3 overflow-x-auto rounded-md bg-black/40 p-3 text-xs text-emerald-300">{shown}</pre>
      ) : null}
    </div>
  );
}
