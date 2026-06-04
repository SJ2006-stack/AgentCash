#!/usr/bin/env node
/**
 * Verifies Linux x64 native bindings resolve next to hoisted packages (Cloudflare CI).
 * Run from repo root on linux: node scripts/verify-cf-native-deps.mjs
 */
import { createRequire } from "node:module";
import { appendFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const logPath = join(root, ".cursor/debug-84dbd6.log");

const pkgs = [
  "@ast-grep/napi-linux-x64-gnu",
  "lightningcss-linux-x64-gnu",
  "@tailwindcss/oxide-linux-x64-gnu",
];

function log(message, data, hypothesisId) {
  const line = JSON.stringify({
    sessionId: "84dbd6",
    runId: process.env.CF_VERIFY_RUN_ID ?? "cf-verify",
    hypothesisId,
    location: "scripts/verify-cf-native-deps.mjs",
    message,
    data,
    timestamp: Date.now(),
  });
  try {
    appendFileSync(logPath, `${line}\n`);
  } catch {
    /* ignore */
  }
  console.log(message, data);
}

log("verify start", { platform: process.platform, arch: process.arch, cwd: process.cwd() }, "H1");

const results = {};
for (const name of pkgs) {
  try {
    results[name] = require.resolve(name, { paths: [join(root, "node_modules/lightningcss")] });
  } catch (err) {
    try {
      results[name] = require.resolve(name, { paths: [root] });
    } catch (err2) {
      results[name] = null;
      log("resolve failed", { name, err: String(err2) }, "H2");
    }
  }
}

log("resolve results", results, "H2");

try {
  require.resolve("lightningcss", { paths: [root] });
  const lcRoot = join(root, "node_modules/lightningcss");
  const sibling = join(root, "node_modules/lightningcss-linux-x64-gnu");
  log("lightningcss layout", {
    lightningcss: lcRoot,
    linuxSiblingExists: results["lightningcss-linux-x64-gnu"] != null,
  }, "H3");
} catch (e) {
  log("lightningcss missing", { err: String(e) }, "H3");
}

const missing = pkgs.filter((p) => !results[p]);
if (process.platform === "linux" && missing.length > 0) {
  log("FAIL linux natives missing", { missing }, "H2");
  process.exit(1);
}

log("OK", { missingOnDarwin: process.platform !== "linux" ? missing : [] }, "H4");
process.exit(0);
