import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/lib/auth/env";

/** ブラウザ専用。ログイン画面など Client Component から使う（C 以降）。 */
export function createBrowserSupabaseClient() {
  const { url, anonKey } = getSupabasePublicEnv();
  return createBrowserClient(url, anonKey);
}
