import { badRequestJsonResponse } from "@/lib/auth/http";
import { getUserId } from "@/lib/auth/session";
import { createContactInquiry } from "@/lib/contact-inquiries/service";

/**
 * お問い合わせ送信（CTL-01 / CTL-02）。
 * 未ログインでも可。ログイン済みなら user_id を付与。
 * body: `{ name, companyName?, email, content }`
 */
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const body = (await request.json()) as {
      name?: unknown;
      companyName?: unknown;
      email?: unknown;
      content?: unknown;
    };

    if (typeof body.name !== "string") {
      return badRequestJsonResponse("name is required");
    }
    if (typeof body.email !== "string") {
      return badRequestJsonResponse("email is required");
    }
    if (typeof body.content !== "string") {
      return badRequestJsonResponse("content is required");
    }
    if (
      body.companyName !== undefined &&
      body.companyName !== null &&
      typeof body.companyName !== "string"
    ) {
      return badRequestJsonResponse("companyName must be a string or null");
    }

    const inquiry = await createContactInquiry(
      {
        name: body.name,
        companyName: body.companyName as string | null | undefined,
        email: body.email,
        content: body.content,
      },
      userId,
    );

    return Response.json({ inquiry }, { status: 201 });
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
