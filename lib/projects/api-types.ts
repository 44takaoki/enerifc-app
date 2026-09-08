import type { ProjectJson } from "./serialize";
import type { ProjectStatus } from "@prisma/client";

export type GetProjectsResponse = {
  projects: ProjectJson[];
};

export type PostProjectRequestBody = {
  name: string;
};

export type PostProjectResponse = {
  project: ProjectJson;
};

// GET /api/projects/:projectId
export type GetProjectResponse = {
  project: ProjectJson;
};

// PATCH /api/projects/:projectId
export type PatchProjectRequestBody = {
  name?: string;
  status?: ProjectStatus;
};

export type PatchProjectResponse = {
  project: ProjectJson;
};
