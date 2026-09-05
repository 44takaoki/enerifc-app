import type { Company } from "@prisma/client";

export type CompanyJson = {
  id: string;
  name: string;
};

export function serializeCompany(company: Company): CompanyJson {
  return {
    id: company.id.toString(),
    name: company.name,
  };
}
