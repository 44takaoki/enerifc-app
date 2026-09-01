-- handle_new_user が profiles.updated_at を入れず INSERT していたため、
-- auth.users 作成時に NOT NULL 違反でロールバックされていた（Dashboard: Failed to create new user）。

ALTER TABLE "profiles"
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        CURRENT_TIMESTAMP
    );
    RETURN NEW;
END;
$$;
