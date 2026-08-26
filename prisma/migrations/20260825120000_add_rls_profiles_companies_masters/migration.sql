-- Enerifc B7: RLS（profiles / companies / master_*）
-- 方針: docs/database.md 7 節。projects 以降はテーブル未作成のため C2 / D3。
-- Prisma（テーブル所有者）は RLS をバイパスする。POLICY は authenticated 直アクセス用。

-- prisma migrate dev の shadow DB には auth.uid() が無い。本物の Supabase では上書きしない。
DO $$
BEGIN
    IF to_regprocedure('auth.uid()') IS NULL THEN
        CREATE SCHEMA IF NOT EXISTS auth;
        CREATE FUNCTION auth.uid()
        RETURNS uuid
        LANGUAGE sql
        STABLE
        AS $fn$ SELECT NULL::uuid $fn$;
    END IF;
END
$$;

-- ------------------------------------------------------------
-- profiles: 自分の行のみ SELECT / UPDATE。INSERT は handle_new_user（SECURITY DEFINER）。
-- ------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------
-- companies: 認証済みは名前検索・作成可。UPDATE / DELETE は付けない（改ざん防止）。
-- ------------------------------------------------------------
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON TABLE public.companies TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.companies_id_seq TO authenticated;

DROP POLICY IF EXISTS companies_select_authenticated ON public.companies;
CREATE POLICY companies_select_authenticated ON public.companies
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS companies_insert_authenticated ON public.companies;
CREATE POLICY companies_insert_authenticated ON public.companies
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- ------------------------------------------------------------
-- master_*: 認証済み SELECT のみ。更新は seed / 管理者。
-- ------------------------------------------------------------
DO $$
DECLARE
    t text;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'master_program_versions',
        'master_region_categories',
        'master_model_buildings',
        'master_building_uses',
        'master_frame_types',
        'master_glass_types',
        'master_insulation_input_methods',
        'master_insulation_types',
        'master_envelope_parts',
        'master_orientations'
    ]
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('GRANT SELECT ON TABLE public.%I TO authenticated', t);
        EXECUTE format('DROP POLICY IF EXISTS master_select_authenticated ON public.%I', t);
        EXECUTE format(
            'CREATE POLICY master_select_authenticated ON public.%I FOR SELECT TO authenticated USING (true)',
            t
        );
    END LOOP;
END
$$;
