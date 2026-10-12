/** The four Services plus "not sure". One place, reused by the form, pages and the enquiry pipeline. */
export const SERVICES = [
  { id: "website-design", name: "Website design", slug: "website-design" },
  { id: "ai-agents-automation", name: "AI agents and automation", slug: "ai-agents-automation" },
  { id: "claude-integration", name: "Claude integration", slug: "claude-integration" },
  { id: "ai-teaching", name: "AI teaching", slug: "ai-teaching" },
  { id: "not-sure", name: "Not sure yet", slug: "not-sure" },
] as const;

export type ServiceId = (typeof SERVICES)[number]["id"];

export const SERVICE_IDS: string[] = SERVICES.map((s) => s.id);

export function serviceName(id: ServiceId): string {
  return SERVICES.find((s) => s.id === id)?.name ?? "Not sure yet";
}
