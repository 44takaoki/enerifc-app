import { Prisma } from "@prisma/client";
import { findOrCreateCompanyByName } from "@/lib/companies/service";
import { prisma } from "@/lib/db/prisma";
import { ProfileNotFoundError } from "@/lib/profile/errors";
import { serializeProfile, type ProfileJson } from "@/lib/profile/serialize";

export type UpdateProfileInput = {
  displayName?: string;
  /** 未指定なら会社は触らない。null または空文字で company_id を外す。 */
  companyName?: string | null;
};

export function normalizeDisplayName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("displayName is required");
  }
  if (trimmed.length > 100) {
    throw new Error("displayName must be at most 100 characters");
  }
  return trimmed;
}

export async function getProfile(
  userId: string,
  email: string | null,
): Promise<ProfileJson> {
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    include: { company: true },
  });

  if (!profile) {
    throw new ProfileNotFoundError();
  }

  return serializeProfile(profile, email);
}

export async function updateProfile(
  userId: string,
  email: string | null,
  input: UpdateProfileInput,
): Promise<ProfileJson> {
  if (input.displayName === undefined && input.companyName === undefined) {
    throw new Error("at least one of displayName or companyName is required");
  }

  const existing = await prisma.profile.findUnique({
    where: { id: userId },
  });

  if (!existing) {
    throw new ProfileNotFoundError();
  }

  const data: Prisma.ProfileUpdateInput = {};

  if (input.displayName !== undefined) {
    data.displayName = normalizeDisplayName(input.displayName);
  }

  if (input.companyName !== undefined) {
    if (input.companyName === null || input.companyName.trim() === "") {
      data.company = { disconnect: true };
    } else {
      const company = await findOrCreateCompanyByName(input.companyName);
      data.company = { connect: { id: BigInt(company.id) } };
    }
  }

  const profile = await prisma.profile.update({
    where: { id: userId },
    data,
    include: { company: true },
  });

  return serializeProfile(profile, email);
}
