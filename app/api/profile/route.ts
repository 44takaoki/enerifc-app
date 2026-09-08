import {
  badRequestJsonResponse,
  isUnauthorizedError,
  notFoundJsonResponse,
  unauthorizedJsonResponse,
} from "@/lib/auth/http";
import { getAuthUser, requireUserId } from "@/lib/auth/session";
import { ProfileNotFoundError } from "@/lib/profile/errors";
import { getProfile, updateProfile } from "@/lib/profile/service";
import type {
  GetProfileResponse,
  PatchProfileRequestBody,
  PatchProfileResponse,
} from "@/lib/profile/api-types";

/** 自分のプロフィール（表示名・会社・メール）。 */
export async function GET() {
  try {
    const userId = await requireUserId();
    const user = await getAuthUser();
    const profile = await getProfile(userId, user?.email ?? null);
    const body: GetProfileResponse = { profile };
    return Response.json(body);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return unauthorizedJsonResponse();
    }
    if (error instanceof ProfileNotFoundError) {
      return notFoundJsonResponse();
    }
    throw error;
  }
}

/**
 * アカウント設定の更新（AUTH-05 準備）。
 * body: `{ displayName?: string, companyName?: string | null }`
 * companyName を null または "" にすると会社紐づけを外す。
 */
export async function PATCH(request: Request) {
  try {
    const userId = await requireUserId();
    const user = await getAuthUser();
    const requestBody = (await request.json()) as PatchProfileRequestBody;

    if (
      requestBody.displayName !== undefined &&
      typeof requestBody.displayName !== "string"
    ) {
      return badRequestJsonResponse("displayName must be a string");
    }

    if (
      requestBody.companyName !== undefined &&
      requestBody.companyName !== null &&
      typeof requestBody.companyName !== "string"
    ) {
      return badRequestJsonResponse("companyName must be a string or null");
    }

    const profile = await updateProfile(userId, user?.email ?? null, {
      displayName: requestBody.displayName,
      companyName: requestBody.companyName as string | null | undefined,
    });

    const responseBody: PatchProfileResponse = { profile };
    return Response.json(responseBody);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return unauthorizedJsonResponse();
    }
    if (error instanceof ProfileNotFoundError) {
      return notFoundJsonResponse();
    }
    if (error instanceof Error) {
      if (
        error.message.startsWith("displayName ") ||
        error.message.startsWith("company name ") ||
        error.message.startsWith("at least one")
      ) {
        return badRequestJsonResponse(error.message);
      }
    }
    throw error;
  }
}
