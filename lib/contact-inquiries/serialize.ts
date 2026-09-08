import type { ContactInquiry } from "@prisma/client";

export type ContactInquiryJson = {
  id: string;
  userId: string | null;
  name: string;
  companyName: string | null;
  email: string;
  content: string;
  createdAt: string;
};

export function serializeContactInquiry(
  inquiry: ContactInquiry,
): ContactInquiryJson {
  return {
    id: inquiry.id.toString(),
    userId: inquiry.userId,
    name: inquiry.name,
    companyName: inquiry.companyName,
    email: inquiry.email,
    content: inquiry.content,
    createdAt: inquiry.createdAt.toISOString(),
  };
}
