import { writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { ensureAgentCashDir } from "../../wallet/local.js";
import { SESSION_PATH } from "../../wallet/paths.js";

export interface SessionRegisterOptions {
  label?: string;
}

/** Stub: writes a local session file only (no JWT auth server in v0). */
export async function runSessionRegisterCommand(
  options: SessionRegisterOptions,
): Promise<void> {
  await ensureAgentCashDir();

  const session = {
    id: randomUUID(),
    label: options.label ?? "local-dev",
    createdAt: new Date().toISOString(),
    note: "stub — full challenge-response JWT not implemented",
  };

  await writeFile(SESSION_PATH, JSON.stringify(session, null, 2), "utf8");

  console.log("Session registered (local stub only).\n");
  console.log(JSON.stringify(session, null, 2));
  console.log(`\nSaved: ${SESSION_PATH}`);
}
