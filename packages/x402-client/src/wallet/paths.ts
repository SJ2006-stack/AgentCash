import { homedir } from "node:os";
import { join } from "node:path";

export const AGENTCASH_DIR = join(homedir(), ".agentcash");
export const WALLET_KEY_PATH = join(AGENTCASH_DIR, "wallet.key");
export const RECEIPTS_PATH = join(AGENTCASH_DIR, "receipts.jsonl");
export const STATE_PATH = join(AGENTCASH_DIR, "state.json");
export const SESSION_PATH = join(AGENTCASH_DIR, "session.json");
export const LOCAL_REGISTRY_PATH = join(AGENTCASH_DIR, "registry.json");
