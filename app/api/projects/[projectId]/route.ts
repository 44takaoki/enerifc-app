import {
  badRequestJsonResponse,
  isUnauthorizedError,
  notFoundJsonResponse,
  unauthorizedJsonResponse,
} from "@/lib/auth/http";
import { requireUserId } from "@/lib/auth/session";
import { ProjectNotFoundError } from "@/lib/projects/errors";
import {
  deleteProject,
  getProject,
  parseProjectId,
  updateProject,
} from "@/lib/projects/service";
import { parseProjectStatus } from "@/lib/projects/validation";
import type {
  GetProjectResponse,
  PatchProjectRequestBody,
  PatchProjectResponse,
} from "@/lib/projects/api-types";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

/** 案件 1 件取得。 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const userId = await requireUserId();
    const { projectId: rawId } = await context.params;
    const projectId = parseProjectId(rawId);

    if (projectId === null) {
      return badRequestJsonResponse("invalid project id");
    }

    const project = await getProject(userId, projectId);
    const body: GetProjectResponse = { project };
    return Response.json(body);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return unauthorizedJsonResponse();
    }
    if (error instanceof ProjectNotFoundError) {
      return notFoundJsonResponse();
    }
    throw error;
  }
}

/** 案件更新。body: `{ "name"?: "...", "status"?: "draft" | ... }` */
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const userId = await requireUserId();
    const { projectId: rawId } = await context.params;
    const projectId = parseProjectId(rawId);

    if (projectId === null) {
      return badRequestJsonResponse("invalid project id");
    }

    const requestBody = (await request.json()) as PatchProjectRequestBody;

    if (
      requestBody.name !== undefined &&
      typeof requestBody.name !== "string"
    ) {
      return badRequestJsonResponse("name must be a string");
    }

    let status: ReturnType<typeof parseProjectStatus>;
    if (requestBody.status === undefined) {
      status = undefined;
    } else if (typeof requestBody.status !== "string") {
      return badRequestJsonResponse("status must be a string");
    } else {
      status = parseProjectStatus(requestBody.status);
      if (status === "invalid") {
        return badRequestJsonResponse("invalid status");
      }
    }

    const project = await updateProject(userId, projectId, {
      name: requestBody.name,
      status,
    });

    const responseBody: PatchProjectResponse = { project };
    return Response.json(responseBody);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return unauthorizedJsonResponse();
    }
    if (error instanceof ProjectNotFoundError) {
      return notFoundJsonResponse();
    }
    if (error instanceof Error) {
      if (error.message.startsWith("name ")) {
        return badRequestJsonResponse(error.message);
      }
      if (error.message.startsWith("at least one")) {
        return badRequestJsonResponse(error.message);
      }
    }
    throw error;
  }
}

/** 論理削除（`deleted_at` を設定）。 */
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const userId = await requireUserId();
    const { projectId: rawId } = await context.params;
    const projectId = parseProjectId(rawId);

    if (projectId === null) {
      return badRequestJsonResponse("invalid project id");
    }

    await deleteProject(userId, projectId);
    return new Response(null, { status: 204 });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return unauthorizedJsonResponse();
    }
    if (error instanceof ProjectNotFoundError) {
      return notFoundJsonResponse();
    }
    throw error;
  }
}
