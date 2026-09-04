import { prisma } from "@/lib/db/prisma";
import {
  serializeCompany,
  type CompanyJson,
} from "@/lib/companies/serialize";

export function normalizeCompanyName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("company name is required");
  }
  if (trimmed.length > 255) {
    throw new Error("company name must be at most 255 characters");
  }
  return trimmed;
}

/** 名前で検索（部分一致・大文字小文字無視）。認証済み SELECT 用。 */
export async function searchCompanies(q: string): Promise<CompanyJson[]> {
  const query = q.trim();
  if (!query) {
    return [];
  }

  const rows = await prisma.company.findMany({
    where: { name: { contains: query, mode: "insensitive" } },
    orderBy: { name: "asc" },
    take: 20,
  });

  return rows.map(serializeCompany);
}

/**
 * 会社名で既存行を探し、無ければ作成する。
 * 一致は trim 後の完全一致（大文字小文字無視）。
 */
export async function findOrCreateCompanyByName(
  name: string,
): Promise<CompanyJson> {
  const normalized = normalizeCompanyName(name);

  const existing = await prisma.company.findFirst({
    where: { name: { equals: normalized, mode: "insensitive" } },
  });

  if (existing) {
    return serializeCompany(existing);
  }

  const created = await prisma.company.create({
    data: { name: normalized },
  });

  return serializeCompany(created);
}
