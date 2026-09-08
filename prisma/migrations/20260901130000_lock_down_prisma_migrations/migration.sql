-- Prisma 内部テーブル _prisma_migrations を Supabase API から触れないようにする。
-- Supabase Security Advisor の rls_disabled_in_public 対策。
-- POLICY は付けない（anon / authenticated は一切アクセス不可）。migrate は DB 所有者が実行する。

ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public._prisma_migrations FROM anon, authenticated;
REVOKE ALL ON TABLE public._prisma_migrations FROM PUBLIC;
