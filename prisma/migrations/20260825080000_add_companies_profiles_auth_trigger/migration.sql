-- Enerifc B6: companies / profiles + Supabase Auth トリガー
-- 方針: docs/database.md 4.3 / 計画 schema.sql + supabase_auth.sql
-- RLS は B7。ここではテーブルと handle_new_user のみ。

-- CreateTable
CREATE TABLE "companies" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "company_id" BIGINT,
    "display_name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_profiles_company_id" ON "profiles"("company_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- サインアップ時に profiles を自動作成する関数（計画 supabase_auth.sql）
-- 関数本体は public にあるので、auth スキーマの有無に関係なく作れる。
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$;

-- auth.users への FK とトリガーは、本物の Supabase にだけ付ける。
-- prisma migrate dev の shadow DB には auth スキーマが無い（P3006 対策）。
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth'
    ) THEN
        ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_fkey"
            FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_new_user();
    END IF;
END
$$;
