import {
  badRequestJsonResponse,
  isUnauthorizedError,
  unauthorizedJsonResponse,
} from "@/lib/auth/http";
import { requireUserId } from "@/lib/auth/session";
import {
  findOrCreateCompanyByName,
  searchCompanies,
} from "@/lib/companies/service";
import type {
  GetCompaniesResponse,
  PostCompanyRequestBody,
  PostCompanyResponse,
} from "@/lib/companies/api-types";

/** 会社名の部分一致検索。`?q=` 必須（空なら空配列）。 */
export async function GET(request: Request) {
  try {
    await requireUserId();
    const { searchParams } = new URL(request.url);
    const companies = await searchCompanies(searchParams.get("q") ?? "");

    const body: GetCompaniesResponse = { companies };
    return Response.json(body);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return unauthorizedJsonResponse();
    }
    throw error;
  }
}

/** 会社名で find-or-create。body: `{ "name": "..." }` */
export async function POST(request: Request) {
  try {
    await requireUserId();
    const raw = (await request.json()) as {
      name?: unknown;
    } as PostCompanyRequestBody;

    if (typeof raw.name !== "string") {
      return badRequestJsonResponse("name is required");
    }

    const company = await findOrCreateCompanyByName(raw.name);

    const body: PostCompanyResponse = { company };
    return Response.json(body);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return unauthorizedJsonResponse();
    }
    if (error instanceof Error && error.message.startsWith("company name ")) {
      return badRequestJsonResponse(error.message);
    }
    throw error;
  }
}
