export type TelemetryEvent = {
  event: string;
  properties?: Record<string, string | number | boolean>;
};

/** No-op unless AGENTCASH_POSTHOG_KEY is set (PostHog integration stub). */
export function track({ event, properties }: TelemetryEvent): void {
  if (process.env.AGENTCASH_NO_TELEMETRY === "1") return;
  const key = process.env.AGENTCASH_POSTHOG_KEY?.trim();
  if (!key) return;

  // v0: fire-and-forget placeholder — wire @posthog/node when product enables it.
  if (process.env.AGENTCASH_TELEMETRY_DEBUG === "1") {
    console.error(`[telemetry] ${event}`, properties ?? {});
  }
}
