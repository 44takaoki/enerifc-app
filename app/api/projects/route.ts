import {
  badRequestJsonResponse,
  isUnauthorizedError,
  unauthorizedJsonResponse,
} from "@/lib/auth/http";
import { requireUserId } from "@/lib/auth/session";
import { ProjectNotFoundError } from "@/lib/projects/errors";
import { createProject, listProjects } from "@/lib/projects/service";
import { parseProjectStatus } from "@/lib/projects/validation";
import type {
  GetProjectsResponse,
  PostProjectRequestBody,
  PostProjectResponse,
} from "@/lib/projects/api-types";

/** 自分の案件一覧。`?q=` 名前検索、`?status=` で絞り込み。 */
export async function GET(request: Request) {
  try {
    const userId = await requireUserId();
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const status = parseProjectStatus(statusParam);

    if (status === "invalid") {
      return badRequestJsonResponse("invalid status");
    }

    const projects = await listProjects(userId, {
      q: searchParams.get("q") ?? undefined,
      status,
    });

    const body: GetProjectsResponse = { projects };
    return Response.json(body);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return unauthorizedJsonResponse();
    }
    throw error;
  }
}

/** 新規案件。body: `{ "name": "..." }` */
export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const raw = (await request.json()) as {
      name?: unknown;
    } as PostProjectRequestBody;

    if (typeof raw.name !== "string") {
      return badRequestJsonResponse("name is required");
    }

    const project = await createProject(userId, { name: raw.name });

    const body: PostProjectResponse = { project };
    return Response.json(body, { status: 201 });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return unauthorizedJsonResponse();
    }
    if (error instanceof Error && error.message.startsWith("name ")) {
      return badRequestJsonResponse(error.message);
    }
    throw error;
  }
}
