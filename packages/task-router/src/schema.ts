import type { RegistryDocument } from "@agentcash/registry";
import { loadRegistry } from "@agentcash/registry";

/** JSON-schema fragment: tool `name` must be a registry slug enum. */
export function buildRegistryToolSchema(
  registry: RegistryDocument = loadRegistry(),
): {
  type: "object";
  properties: {
    tools: {
      type: "array";
      items: {
        type: "object";
        properties: {
          slug: { type: "string"; enum: string[] };
          reason: { type: "string" };
        };
        required: ["slug", "reason"];
        additionalProperties: false;
      };
    };
  };
  required: ["tools"];
  additionalProperties: false;
} {
  const slugs = registry.entries
    .filter((e) => e.status !== "coming_soon")
    .map((e) => e.slug);

  return {
    type: "object",
    properties: {
      tools: {
        type: "array",
        items: {
          type: "object",
          properties: {
            slug: { type: "string", enum: slugs },
            reason: { type: "string" },
          },
          required: ["slug", "reason"],
          additionalProperties: false,
        },
      },
    },
    required: ["tools"],
    additionalProperties: false,
  };
}

export function assertKnownSlugs(
  registry: RegistryDocument,
  slugs: string[],
): void {
  const allowed = new Set(
    registry.entries
      .filter((e) => e.status !== "coming_soon")
      .map((e) => e.slug),
  );
  for (const slug of slugs) {
    if (!allowed.has(slug)) {
      throw new Error(
        `Unknown tool slug "${slug}". Allowed: ${[...allowed].join(", ")}`,
      );
    }
  }
}
