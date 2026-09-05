import { Prisma, type ProjectStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { DEFAULT_PROGRAM_VERSION } from "@/lib/projects/constants";
import { ProjectNotFoundError } from "@/lib/projects/errors";
import { serializeProject, type ProjectJson } from "@/lib/projects/serialize";

export type ListProjectsOptions = {
  q?: string;
  status?: ProjectStatus;
};

export type CreateProjectInput = {
  name: string;
};

export type UpdateProjectInput = {
  name?: string;
  status?: ProjectStatus;
};

function activeProjectWhere(
  userId: string,
  projectId: bigint,
): Prisma.ProjectWhereInput {
  return {
    id: projectId,
    userId,
    deletedAt: null,
  };
}

export function parseProjectId(raw: string): bigint | null {
  if (!/^\d+$/.test(raw)) {
    return null;
  }
  return BigInt(raw);
}

export function normalizeProjectName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("name is required");
  }
  if (trimmed.length > 255) {
    throw new Error("name must be at most 255 characters");
  }
  return trimmed;
}

export async function listProjects(
  userId: string,
  options: ListProjectsOptions = {},
): Promise<ProjectJson[]> {
  const where: Prisma.ProjectWhereInput = {
    userId,
    deletedAt: null,
  };

  if (options.status) {
    where.status = options.status;
  }

  if (options.q) {
    where.name = { contains: options.q.trim(), mode: "insensitive" };
  }

  const rows = await prisma.project.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  });

  return rows.map(serializeProject);
}

export async function getProject(
  userId: string,
  projectId: bigint,
): Promise<ProjectJson> {
  const project = await prisma.project.findFirst({
    where: activeProjectWhere(userId, projectId),
  });

  if (!project) {
    throw new ProjectNotFoundError();
  }

  return serializeProject(project);
}

export async function createProject(
  userId: string,
  input: CreateProjectInput,
): Promise<ProjectJson> {
  const name = normalizeProjectName(input.name);

  const project = await prisma.project.create({
    data: {
      userId,
      name,
      programVersion: DEFAULT_PROGRAM_VERSION,
    },
  });

  return serializeProject(project);
}

export async function updateProject(
  userId: string,
  projectId: bigint,
  input: UpdateProjectInput,
): Promise<ProjectJson> {
  if (input.name === undefined && input.status === undefined) {
    throw new Error("at least one of name or status is required");
  }

  const existing = await prisma.project.findFirst({
    where: activeProjectWhere(userId, projectId),
  });

  if (!existing) {
    throw new ProjectNotFoundError();
  }

  const data: Prisma.ProjectUpdateInput = {};

  if (input.name !== undefined) {
    data.name = normalizeProjectName(input.name);
  }

  if (input.status !== undefined) {
    data.status = input.status;
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data,
  });

  return serializeProject(project);
}

export async function deleteProject(
  userId: string,
  projectId: bigint,
): Promise<void> {
  const existing = await prisma.project.findFirst({
    where: activeProjectWhere(userId, projectId),
  });

  if (!existing) {
    throw new ProjectNotFoundError();
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { deletedAt: new Date() },
  });
}
