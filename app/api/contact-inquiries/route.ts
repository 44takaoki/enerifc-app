import { badRequestJsonResponse } from "@/lib/auth/http";
import { getUserId } from "@/lib/auth/session";
import { createContactInquiry } from "@/lib/contact-inquiries/service";
import type {
  PostContactInquiryRequestBody,
  PostContactInquiryResponse,
} from "@/lib/contact-inquiries/api-types";

/**
 * お問い合わせ送信（CTL-01 / CTL-02）。
 * 未ログインでも可。ログイン済みなら user_id を付与。
 * body: `{ name, companyName?, email, content }`
 */
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const requestBody = (await request.json()) as PostContactInquiryRequestBody;

    if (typeof requestBody.name !== "string") {
      return badRequestJsonResponse("name is required");
    }
    if (typeof requestBody.email !== "string") {
      return badRequestJsonResponse("email is required");
    }
    if (typeof requestBody.content !== "string") {
      return badRequestJsonResponse("content is required");
    }
    if (
      requestBody.companyName !== undefined &&
      requestBody.companyName !== null &&
      typeof requestBody.companyName !== "string"
    ) {
      return badRequestJsonResponse("companyName must be a string or null");
    }

    const inquiry = await createContactInquiry(
      {
        name: requestBody.name,
        companyName: requestBody.companyName as string | null | undefined,
        email: requestBody.email,
        content: requestBody.content,
      },
      userId
    );

    const responseBody: PostContactInquiryResponse = { inquiry };
    return Response.json(responseBody, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      const message = error.message;
      if (
        message.startsWith("name ") ||
        message.startsWith("companyName ") ||
        message.startsWith("email ") ||
        message.startsWith("content ")
      ) {
        return badRequestJsonResponse(message);
      }
    }
    throw error;
  }
}
