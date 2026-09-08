import type { User } from "@supabase/supabase-js";
import { UnauthorizedError } from "@/lib/auth/errors";
import { createServerSupabaseClient } from "@/lib/auth/server";

/**
 * サーバで Auth を検証してユーザーを返す。
 * Cookie の JWT を Supabase に問い合わせる（getSession より改ざんに強い）。
 */
export async function getAuthUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/** profiles.id と同じ UUID。未ログインなら null。 */
export async function getUserId(): Promise<string | null> {
  const user = await getAuthUser();
  return user?.id ?? null;
}

/** ログイン必須の API 用。未ログインなら UnauthorizedError。 */
export async function requireUserId(): Promise<string> {
  const userId = await getUserId();
  if (!userId) {
    throw new UnauthorizedError();
  }
  return userId;
}
