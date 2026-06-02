/** Strip Anthropic-style API keys from strings before logging. */
const ANTHROPIC_KEY_PATTERN = /sk-ant-[A-Za-z0-9_-]+/g;

export function scrubSecrets(input: string): string {
  return input.replace(ANTHROPIC_KEY_PATTERN, "sk-ant-[REDACTED]");
}

export function scrubSecretsDeep<T>(value: T): T {
  if (typeof value === "string") {
    return scrubSecrets(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => scrubSecretsDeep(item)) as T;
  }
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = scrubSecretsDeep(v);
    }
    return out as T;
  }
  return value;
}
