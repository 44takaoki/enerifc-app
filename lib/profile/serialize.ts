import type { Company, Profile } from "@prisma/client";
import {
  serializeCompany,
  type CompanyJson,
} from "@/lib/companies/serialize";

export type ProfileJson = {
  id: string;
  displayName: string;
  company: CompanyJson | null;
  email: string | null;
};

type ProfileWithCompany = Profile & { company: Company | null };

export function serializeProfile(
  profile: ProfileWithCompany,
  email: string | null,
): ProfileJson {
  return {
    id: profile.id,
    displayName: profile.displayName,
    company: profile.company ? serializeCompany(profile.company) : null,
    email,
  };
}
