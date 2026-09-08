import {
  isUnauthorizedError,
  unauthorizedJsonResponse,
} from "@/lib/auth/http";
import { requireUserId } from "@/lib/auth/session";

/** C1 確認用。ログイン済みなら userId を返す。本番の画面は後続フェーズ。 */
export async function GET() {
  try {
    const userId = await requireUserId();
    return Response.json({ userId });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return unauthorizedJsonResponse();
    }
    throw error;
  }
}
