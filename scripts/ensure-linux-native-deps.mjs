#!/usr/bin/env node
/**
 * On Linux CI, ensure hoisted native bindings exist beside root node_modules.
 * Belt-and-suspenders when optional deps or cache omit platform packages.
 */
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const logPath = join(root, ".cursor/debug-84dbd6.log");
const require = createRequire(import.meta.url);

const PINNED = {
  "@ast-grep/napi-linux-x64-gnu": "0.40.5",
  "lightningcss-linux-x64-gnu": "1.32.0",
  "@tailwindcss/oxide-linux-x64-gnu": "4.3.0",
};

function log(message, data, hypothesisId) {
  const line = JSON.stringify({
    sessionId: "84dbd6",
    runId: process.env.CF_VERIFY_RUN_ID ?? "ensure-linux",
    hypothesisId,
    location: "scripts/ensure-linux-native-deps.mjs",
    message,
    data,
    timestamp: Date.now(),
  });
  try {
    appendFileSync(logPath, `${line}\n`);
  } catch {
    /* ignore */
  }
}

if (process.platform !== "linux") {
  log("skip non-linux", { platform: process.platform }, "H4");
  process.exit(0);
}

log("ensure start", { platform: process.platform, arch: process.arch }, "H1");

const missing = [];
for (const name of Object.keys(PINNED)) {
  try {
    require.resolve(name, { paths: [root] });
    log("resolved", { name }, "H2");
  } catch {
    missing.push(name);
    log("missing", { name }, "H2");
  }
}

if (missing.length === 0) {
  log("all natives present", {}, "H2");
  process.exit(0);
}

const specs = missing.map((n) => `${n}@${PINNED[n]}`).join(" ");
log("installing", { specs }, "H3");
execSync(`npm install --no-save ${specs}`, { cwd: root, stdio: "inherit" });

for (const name of missing) {
  require.resolve(name, { paths: [root] });
  log("resolved after install", { name }, "H3");
}

log("ensure OK", { installed: missing }, "H3");
process.exit(0);
