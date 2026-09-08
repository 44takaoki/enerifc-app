import type { Project, ProjectStatus } from "@prisma/client";

export type ProjectJson = {
  id: string;
  name: string;
  status: ProjectStatus;
  programVersion: string;
  totalFloorArea: number | null;
  createdAt: string;
  updatedAt: string;
};

export function serializeProject(project: Project): ProjectJson {
  return {
    id: project.id.toString(),
    name: project.name,
    status: project.status,
    programVersion: project.programVersion,
    totalFloorArea:
      project.totalFloorArea === null
        ? null
        : Number(project.totalFloorArea),
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}
