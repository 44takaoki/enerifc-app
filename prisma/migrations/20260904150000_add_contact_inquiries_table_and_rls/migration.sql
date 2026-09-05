-- Enerifc C4: contact_inquiries テーブル + RLS
-- 方針: 計画 schema.sql / docs/requirements.md CTL-01

CREATE TABLE "contact_inquiries" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID,
    "name" VARCHAR(100) NOT NULL,
    "company_name" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_inquiries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_contact_inquiries_user_id" ON "contact_inquiries"("user_id");

ALTER TABLE "contact_inquiries" ADD CONSTRAINT "contact_inquiries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RLS: 認証済み INSERT。SELECT は自分の送信分のみ（user_id IS NULL は API 経由のみ）
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON TABLE public.contact_inquiries TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.contact_inquiries_id_seq TO authenticated;

DROP POLICY IF EXISTS contact_inquiries_insert_authenticated ON public.contact_inquiries;
CREATE POLICY contact_inquiries_insert_authenticated ON public.contact_inquiries
    FOR INSERT TO authenticated
    WITH CHECK (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS contact_inquiries_select_own ON public.contact_inquiries;
CREATE POLICY contact_inquiries_select_own ON public.contact_inquiries
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());
