import { UnauthorizedError } from "@/lib/auth/errors";
import type { ApiErrorResponse } from "@/lib/api/errors";

/** Route Handler で requireUserId の catch 用。 */
export function unauthorizedJsonResponse() {
  const body: ApiErrorResponse = { error: "Unauthorized" };
  return Response.json(body, { status: 401 });
}

export function isUnauthorizedError(
  error: unknown
): error is UnauthorizedError {
  return error instanceof UnauthorizedError;
}

export function badRequestJsonResponse(message: string) {
  const body: ApiErrorResponse = { error: message };
  return Response.json(body, { status: 400 });
}

export function notFoundJsonResponse(message = "Not found") {
  const body: ApiErrorResponse = { error: message };
  return Response.json(body, { status: 404 });
}
