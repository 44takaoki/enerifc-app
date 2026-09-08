-- Enerifc C2: projects テーブル + RLS
-- 方針: docs/database.md 5 節 / 計画 schema.sql

-- CreateTable
CREATE TABLE "projects" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "status" "project_status" NOT NULL DEFAULT 'draft',
    "program_version" VARCHAR(20) NOT NULL DEFAULT '3.10',
    "total_floor_area" DECIMAL(12,2),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_projects_user_id" ON "projects"("user_id");
CREATE INDEX "idx_projects_status" ON "projects"("status");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "projects" ADD CONSTRAINT "projects_program_version_fkey" FOREIGN KEY ("program_version") REFERENCES "master_program_versions"("version") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RLS: 自分の案件のみ（論理削除も UPDATE）
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.projects TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.projects_id_seq TO authenticated;

DROP POLICY IF EXISTS projects_all_own ON public.projects;
CREATE POLICY projects_all_own ON public.projects
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
