function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`環境変数 ${name} が未設定です。.env.example を参照してください。`);
  }
  return value;
}

/** ブラウザとサーバの Supabase クライアントで共通の公開キー。 */
export function getSupabasePublicEnv() {
  return {
    url: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}
