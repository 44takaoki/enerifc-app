import { UnauthorizedError } from "@/lib/auth/errors";

/** Route Handler で requireUserId の catch 用。 */
export function unauthorizedJsonResponse() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export function isUnauthorizedError(error: unknown): error is UnauthorizedError {
  return error instanceof UnauthorizedError;
}

export function badRequestJsonResponse(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export function notFoundJsonResponse(message = "Not found") {
  return Response.json({ error: message }, { status: 404 });
}
