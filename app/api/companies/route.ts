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

/** 会社名の部分一致検索。`?q=` 必須（空なら空配列）。 */
export async function GET(request: Request) {
  try {
    await requireUserId();
    const { searchParams } = new URL(request.url);
    const companies = await searchCompanies(searchParams.get("q") ?? "");
    return Response.json({ companies });
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
    const body = (await request.json()) as { name?: unknown };

    if (typeof body.name !== "string") {
      return badRequestJsonResponse("name is required");
    }

    const company = await findOrCreateCompanyByName(body.name);
    return Response.json({ company }, { status: 200 });
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
