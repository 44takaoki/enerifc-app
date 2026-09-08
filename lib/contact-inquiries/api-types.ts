import type { ContactInquiryJson } from "./serialize";

export type PostContactInquiryRequestBody = {
  name: string;
  companyName?: string | null;
  email: string;
  content: string;
};

export type PostContactInquiryResponse = {
  inquiry: ContactInquiryJson;
};
