import "dotenv/config";
import { defineConfig } from "prisma/config";

// Supabase Auth は Prisma が DDL しない（DEC-21）。
// migrate が auth.* を「余分」と見て DROP しようとしたら、この配列に足す。
const supabaseAuthTables = [
  "auth.users",
  "auth.identities",
  "auth.sessions",
  "auth.refresh_tokens",
  "auth.audit_log_entries",
  "auth.instances",
  "auth.schema_migrations",
  "auth.mfa_factors",
  "auth.mfa_challenges",
  "auth.mfa_amr_claims",
  "auth.sso_providers",
  "auth.sso_domains",
  "auth.saml_providers",
  "auth.saml_relay_states",
  "auth.flow_state",
  "auth.one_time_tokens",
  "auth.oauth_clients",
  "auth.oauth_authorizations",
  "auth.oauth_consents",
  "auth.oauth_client_states",
  "auth.custom_oauth_providers",
  "auth.webauthn_challenges",
  "auth.webauthn_credentials",
];

const supabaseAuthEnums = [
  "auth.aal_level",
  "auth.code_challenge_method",
  "auth.factor_status",
  "auth.factor_type",
  "auth.one_time_token_type",
  "auth.oauth_authorization_status",
  "auth.oauth_client_type",
  "auth.oauth_registration_type",
  "auth.oauth_response_type",
];

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
    // shadow DB は素の Postgres。B6 の FK / B7 の GRANT が通るように最低限だけ用意する。
    initShadowDb: `
      DO $shadow$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
          CREATE ROLE authenticated;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
          CREATE ROLE anon;
        END IF;
      END
      $shadow$;
      CREATE SCHEMA IF NOT EXISTS auth;
      CREATE TABLE IF NOT EXISTS auth.users (id UUID PRIMARY KEY);
      CREATE OR REPLACE FUNCTION auth.uid()
      RETURNS uuid
      LANGUAGE sql
      STABLE
      AS $fn$ SELECT NULL::uuid $fn$;
    `,
  },
  experimental: {
    externalTables: true,
  },
  tables: {
    external: supabaseAuthTables,
  },
  enums: {
    external: supabaseAuthEnums,
  },
});
