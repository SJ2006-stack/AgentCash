import { scrubSecrets } from "./scrub-secrets.js";

function scrubArgs(args: unknown[]): unknown[] {
  return args.map((arg) => {
    if (typeof arg === "string") return scrubSecrets(arg);
    return arg;
  });
}

export const safeLog = {
  log(...args: unknown[]): void {
    console.log(...scrubArgs(args));
  },
  warn(...args: unknown[]): void {
    console.warn(...scrubArgs(args));
  },
  error(...args: unknown[]): void {
    console.error(...scrubArgs(args));
  },
};
