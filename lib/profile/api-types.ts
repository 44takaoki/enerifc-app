import type { ProfileJson } from "@/lib/profile/serialize";

export type GetProfileResponse = {
  profile: ProfileJson;
};

export type PatchProfileRequestBody = {
  displayName?: string;
  companyName?: string | null;
};

export type PatchProfileResponse = {
  profile: ProfileJson;
};
