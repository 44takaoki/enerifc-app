import { prisma } from "@/lib/db/prisma";
import {
  serializeContactInquiry,
  type ContactInquiryJson,
} from "@/lib/contact-inquiries/serialize";

export type CreateContactInquiryInput = {
  name: string;
  companyName?: string | null;
  email: string;
  content: string;
};

const MAX_CONTENT_LENGTH = 10_000;

export function normalizeInquiryName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("name is required");
  }
  if (trimmed.length > 100) {
    throw new Error("name must be at most 100 characters");
  }
  return trimmed;
}

export function normalizeInquiryCompanyName(
  companyName: string | null | undefined,
): string | null {
  if (companyName === undefined || companyName === null) {
    return null;
  }
  const trimmed = companyName.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.length > 255) {
    throw new Error("companyName must be at most 255 characters");
  }
  return trimmed;
}

export function normalizeInquiryEmail(email: string): string {
  const trimmed = email.trim();
  if (!trimmed) {
    throw new Error("email is required");
  }
  if (trimmed.length > 255) {
    throw new Error("email must be at most 255 characters");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new Error("email is invalid");
  }
  return trimmed;
}

export function normalizeInquiryContent(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error("content is required");
  }
  if (trimmed.length > MAX_CONTENT_LENGTH) {
    throw new Error(`content must be at most ${MAX_CONTENT_LENGTH} characters`);
  }
  return trimmed;
}

/** お問い合わせを 1 件保存。userId があれば profiles に紐づける（CTL-01）。 */
export async function createContactInquiry(
  input: CreateContactInquiryInput,
  userId: string | null,
): Promise<ContactInquiryJson> {
  const inquiry = await prisma.contactInquiry.create({
    data: {
      userId,
      name: normalizeInquiryName(input.name),
      companyName: normalizeInquiryCompanyName(input.companyName),
      email: normalizeInquiryEmail(input.email),
      content: normalizeInquiryContent(input.content),
    },
  });

  return serializeContactInquiry(inquiry);
}
