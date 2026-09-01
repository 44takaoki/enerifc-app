import { ProjectStatus } from "@prisma/client";

const PROJECT_STATUSES = new Set<string>(Object.values(ProjectStatus));

export function parseProjectStatus(
  raw: string | null,
): ProjectStatus | undefined | "invalid" {
  if (!raw) {
    return undefined;
  }
  if (PROJECT_STATUSES.has(raw)) {
    return raw as ProjectStatus;
  }
  return "invalid";
}
