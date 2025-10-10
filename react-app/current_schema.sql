


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."callback_status" AS ENUM (
    'PENDING',
    'SENT',
    'FAILED'
);


ALTER TYPE "public"."callback_status" OWNER TO "postgres";


CREATE TYPE "public"."subscription_tier" AS ENUM (
    'FREE',
    'PREMIUM',
    'BUSINESS'
);


ALTER TYPE "public"."subscription_tier" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."business_cards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" character varying(100) NOT NULL,
    "title" character varying(100),
    "company" character varying(100),
    "department" character varying(100),
    "phone" character varying(20),
    "email" character varying(255),
    "website" character varying(255),
    "address" "text",
    "linkedin" character varying(255),
    "instagram" character varying(255),
    "facebook" character varying(255),
    "twitter" character varying(255),
    "youtube" character varying(255),
    "github" character varying(255),
    "introduction" "text",
    "services" "text"[],
    "skills" "text"[],
    "theme" character varying(50) DEFAULT 'trendy'::character varying,
    "card_color" character varying(7),
    "font_style" character varying(50),
    "profile_image" "text",
    "company_logo" "text",
    "background_image" "text",
    "qr_code" "text",
    "custom_url" character varying(100),
    "short_url" character varying(50),
    "is_active" boolean DEFAULT true,
    "is_primary" boolean DEFAULT false,
    "view_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."business_cards" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."callback_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "phone_number" "text",
    "message" "text",
    "status" "public"."callback_status" DEFAULT 'PENDING'::"public"."callback_status",
    "sent_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."callback_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."qr_codes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "business_card_id" "uuid",
    "short_code" character varying(20) NOT NULL,
    "target_url" "text" NOT NULL,
    "target_type" character varying(20) DEFAULT 'static'::character varying NOT NULL,
    "target_rules" "jsonb",
    "campaign" character varying(50),
    "max_scans" integer,
    "expires_at" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "scan_count" integer DEFAULT 0,
    CONSTRAINT "qr_codes_target_type_check" CHECK ((("target_type")::"text" = ANY ((ARRAY['static'::character varying, 'dynamic'::character varying])::"text"[])))
);


ALTER TABLE "public"."qr_codes" OWNER TO "postgres";


COMMENT ON TABLE "public"."qr_codes" IS 'Stores QR code configurations with dynamic routing capabilities';



CREATE TABLE IF NOT EXISTS "public"."qr_scans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "qr_code_id" "uuid" NOT NULL,
    "scanned_at" timestamp with time zone DEFAULT "now"(),
    "visitor_id" "uuid",
    "ip_address" "inet",
    "user_agent" "text",
    "country" character varying(2),
    "city" character varying(100),
    "device_type" character varying(20),
    "referrer" "text",
    "session_duration" integer,
    "browser" character varying(50),
    "os" character varying(50),
    CONSTRAINT "qr_scans_device_type_check" CHECK ((("device_type")::"text" = ANY ((ARRAY['mobile'::character varying, 'tablet'::character varying, 'desktop'::character varying, 'other'::character varying])::"text"[])))
);


ALTER TABLE "public"."qr_scans" OWNER TO "postgres";


COMMENT ON TABLE "public"."qr_scans" IS 'Tracks individual QR code scans with visitor analytics';



COMMENT ON COLUMN "public"."qr_scans"."browser" IS 'Browser name detected from user agent';



COMMENT ON COLUMN "public"."qr_scans"."os" IS 'Operating system detected from user agent';



CREATE OR REPLACE VIEW "public"."qr_code_analytics" WITH ("security_invoker"='on') AS
 SELECT "qc"."id",
    "qc"."user_id",
    "qc"."short_code",
    "qc"."campaign",
    "qc"."created_at",
    "count"("qs"."id") AS "total_scans",
    "count"(DISTINCT "qs"."visitor_id") AS "unique_visitors",
    "count"(DISTINCT "date"("qs"."scanned_at")) AS "active_days",
    "count"(
        CASE
            WHEN (("qs"."device_type")::"text" = 'mobile'::"text") THEN 1
            ELSE NULL::integer
        END) AS "mobile_scans",
    "count"(
        CASE
            WHEN (("qs"."device_type")::"text" = 'desktop'::"text") THEN 1
            ELSE NULL::integer
        END) AS "desktop_scans",
    "count"(
        CASE
            WHEN (("qs"."device_type")::"text" = 'tablet'::"text") THEN 1
            ELSE NULL::integer
        END) AS "tablet_scans",
    "max"("qs"."scanned_at") AS "last_scanned_at",
    "avg"("qs"."session_duration") AS "avg_session_duration"
   FROM ("public"."qr_codes" "qc"
     LEFT JOIN "public"."qr_scans" "qs" ON (("qc"."id" = "qs"."qr_code_id")))
  GROUP BY "qc"."id", "qc"."user_id", "qc"."short_code", "qc"."campaign", "qc"."created_at";


ALTER VIEW "public"."qr_code_analytics" OWNER TO "postgres";


COMMENT ON VIEW "public"."qr_code_analytics" IS 'Aggregated analytics for QR code performance tracking';



CREATE TABLE IF NOT EXISTS "public"."sidejob_cards" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "image_url" "text",
    "price" "text",
    "cta_text" "text",
    "cta_url" "text",
    "display_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "view_count" integer DEFAULT 0,
    "click_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "business_card_id" "uuid"
);


ALTER TABLE "public"."sidejob_cards" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "company" "text",
    "position" "text",
    "title" "text",
    "bio" "text",
    "address" "text",
    "social_links" "jsonb" DEFAULT '{}'::"jsonb",
    "theme_settings" "jsonb" DEFAULT '{"theme": "simple", "fontFamily": "Inter", "primaryColor": "#000000"}'::"jsonb",
    "callback_settings" "jsonb" DEFAULT '{"enabled": false, "provider": "twilio"}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "theme" character varying(50) DEFAULT 'trendy'::character varying
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."user_profiles"."theme" IS 'User selected theme for their business card (trendy, apple, professional, simple, default)';



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "email" "text" NOT NULL,
    "name" "text" NOT NULL,
    "phone" "text",
    "domain_name" "text",
    "profile_image_url" "text",
    "subscription_tier" "public"."subscription_tier" DEFAULT 'FREE'::"public"."subscription_tier",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."visitor_stats" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "visitor_ip" "inet",
    "user_agent" "text",
    "referrer" "text",
    "page_url" "text",
    "visit_date" "date" DEFAULT CURRENT_DATE,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."visitor_stats" OWNER TO "postgres";


ALTER TABLE ONLY "public"."business_cards"
    ADD CONSTRAINT "business_cards_custom_url_key" UNIQUE ("custom_url");



ALTER TABLE ONLY "public"."business_cards"
    ADD CONSTRAINT "business_cards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."callback_logs"
    ADD CONSTRAINT "callback_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."qr_codes"
    ADD CONSTRAINT "qr_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."qr_codes"
    ADD CONSTRAINT "qr_codes_short_code_key" UNIQUE ("short_code");



ALTER TABLE ONLY "public"."qr_scans"
    ADD CONSTRAINT "qr_scans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sidejob_cards"
    ADD CONSTRAINT "sidejob_cards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_domain_name_key" UNIQUE ("domain_name");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."visitor_stats"
    ADD CONSTRAINT "visitor_stats_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_business_cards_custom_url" ON "public"."business_cards" USING "btree" ("custom_url");



CREATE INDEX "idx_business_cards_is_active" ON "public"."business_cards" USING "btree" ("is_active");



CREATE INDEX "idx_business_cards_user_id" ON "public"."business_cards" USING "btree" ("user_id");



CREATE INDEX "idx_callback_user_status" ON "public"."callback_logs" USING "btree" ("user_id", "status");



CREATE INDEX "idx_qr_codes_business_card_id" ON "public"."qr_codes" USING "btree" ("business_card_id");



CREATE INDEX "idx_qr_codes_is_active" ON "public"."qr_codes" USING "btree" ("is_active");



CREATE INDEX "idx_qr_codes_short_code" ON "public"."qr_codes" USING "btree" ("short_code");



CREATE INDEX "idx_qr_codes_user_id" ON "public"."qr_codes" USING "btree" ("user_id");



CREATE INDEX "idx_qr_scans_qr_code_id" ON "public"."qr_scans" USING "btree" ("qr_code_id");



CREATE INDEX "idx_qr_scans_scanned_at" ON "public"."qr_scans" USING "btree" ("scanned_at");



CREATE INDEX "idx_qr_scans_visitor_id" ON "public"."qr_scans" USING "btree" ("visitor_id");



CREATE INDEX "idx_sidejob_business_card" ON "public"."sidejob_cards" USING "btree" ("business_card_id");



CREATE INDEX "idx_sidejob_user_active" ON "public"."sidejob_cards" USING "btree" ("user_id", "is_active");



CREATE INDEX "idx_users_domain" ON "public"."users" USING "btree" ("domain_name");



CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");



CREATE INDEX "idx_visitor_user_date" ON "public"."visitor_stats" USING "btree" ("user_id", "visit_date");



CREATE OR REPLACE TRIGGER "update_business_cards_updated_at" BEFORE UPDATE ON "public"."business_cards" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_qr_codes_updated_at" BEFORE UPDATE ON "public"."qr_codes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_sidejob_cards_updated_at" BEFORE UPDATE ON "public"."sidejob_cards" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_profiles_updated_at" BEFORE UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."business_cards"
    ADD CONSTRAINT "business_cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."callback_logs"
    ADD CONSTRAINT "callback_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."qr_codes"
    ADD CONSTRAINT "qr_codes_business_card_id_fkey" FOREIGN KEY ("business_card_id") REFERENCES "public"."business_cards"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."qr_codes"
    ADD CONSTRAINT "qr_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."qr_scans"
    ADD CONSTRAINT "qr_scans_qr_code_id_fkey" FOREIGN KEY ("qr_code_id") REFERENCES "public"."qr_codes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sidejob_cards"
    ADD CONSTRAINT "sidejob_cards_business_card_id_fkey" FOREIGN KEY ("business_card_id") REFERENCES "public"."business_cards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sidejob_cards"
    ADD CONSTRAINT "sidejob_cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."visitor_stats"
    ADD CONSTRAINT "visitor_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Cards are viewable by everyone" ON "public"."sidejob_cards" FOR SELECT USING ((("is_active" = true) OR ("auth"."uid"() = "user_id")));



CREATE POLICY "Public can insert scan records" ON "public"."qr_scans" FOR INSERT WITH CHECK (true);



CREATE POLICY "Public can view active QR codes by short_code" ON "public"."qr_codes" FOR SELECT USING ((("is_active" = true) AND (("expires_at" IS NULL) OR ("expires_at" > "now"()))));



CREATE POLICY "Users can delete their own QR codes" ON "public"."qr_codes" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own QR codes" ON "public"."qr_codes" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update scan records for their own QR codes" ON "public"."qr_scans" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."qr_codes"
  WHERE (("qr_codes"."id" = "qr_scans"."qr_code_id") AND ("qr_codes"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update their own QR codes" ON "public"."qr_codes" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view scans for their own QR codes" ON "public"."qr_scans" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."qr_codes"
  WHERE (("qr_codes"."id" = "qr_scans"."qr_code_id") AND ("qr_codes"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own QR codes" ON "public"."qr_codes" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."business_cards" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "business_cards_delete_own" ON "public"."business_cards" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "business_cards_insert_own" ON "public"."business_cards" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "business_cards_select_own" ON "public"."business_cards" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "business_cards_select_public" ON "public"."business_cards" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "business_cards_update_own" ON "public"."business_cards" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."callback_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "callback_logs_delete_own" ON "public"."callback_logs" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "callback_logs_insert_own" ON "public"."callback_logs" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "callback_logs_select_own" ON "public"."callback_logs" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "callback_logs_update_own" ON "public"."callback_logs" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."qr_codes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "qr_codes_delete_own" ON "public"."qr_codes" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "qr_codes_insert_own" ON "public"."qr_codes" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "qr_codes_select_active" ON "public"."qr_codes" FOR SELECT TO "authenticated", "anon" USING ((("is_active" = true) AND (("expires_at" IS NULL) OR ("expires_at" > "now"()))));



CREATE POLICY "qr_codes_select_own" ON "public"."qr_codes" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "qr_codes_update_own" ON "public"."qr_codes" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "qr_codes_update_scan_count" ON "public"."qr_codes" FOR UPDATE TO "service_role" USING (true);



ALTER TABLE "public"."qr_scans" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "qr_scans_insert_all" ON "public"."qr_scans" FOR INSERT TO "authenticated", "anon", "service_role" WITH CHECK (true);



CREATE POLICY "qr_scans_select_own" ON "public"."qr_scans" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."qr_codes"
  WHERE (("qr_codes"."id" = "qr_scans"."qr_code_id") AND ("qr_codes"."user_id" = "auth"."uid"())))));



CREATE POLICY "qr_scans_update_own" ON "public"."qr_scans" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."qr_codes"
  WHERE (("qr_codes"."id" = "qr_scans"."qr_code_id") AND ("qr_codes"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."sidejob_cards" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "sidejob_cards_delete_own" ON "public"."sidejob_cards" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "sidejob_cards_insert_own" ON "public"."sidejob_cards" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "sidejob_cards_select_own" ON "public"."sidejob_cards" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "sidejob_cards_select_public" ON "public"."sidejob_cards" FOR SELECT TO "authenticated", "anon" USING (("is_active" = true));



CREATE POLICY "sidejob_cards_update_own" ON "public"."sidejob_cards" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."visitor_stats" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "visitor_stats_insert_all" ON "public"."visitor_stats" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "visitor_stats_select_own" ON "public"."visitor_stats" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "visitor_stats_update_own" ON "public"."visitor_stats" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON TABLE "public"."business_cards" TO "anon";
GRANT ALL ON TABLE "public"."business_cards" TO "authenticated";
GRANT ALL ON TABLE "public"."business_cards" TO "service_role";



GRANT ALL ON TABLE "public"."callback_logs" TO "anon";
GRANT ALL ON TABLE "public"."callback_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."callback_logs" TO "service_role";



GRANT ALL ON TABLE "public"."qr_codes" TO "anon";
GRANT ALL ON TABLE "public"."qr_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."qr_codes" TO "service_role";



GRANT ALL ON TABLE "public"."qr_scans" TO "anon";
GRANT ALL ON TABLE "public"."qr_scans" TO "authenticated";
GRANT ALL ON TABLE "public"."qr_scans" TO "service_role";



GRANT ALL ON TABLE "public"."qr_code_analytics" TO "anon";
GRANT ALL ON TABLE "public"."qr_code_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."qr_code_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."sidejob_cards" TO "anon";
GRANT ALL ON TABLE "public"."sidejob_cards" TO "authenticated";
GRANT ALL ON TABLE "public"."sidejob_cards" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."visitor_stats" TO "anon";
GRANT ALL ON TABLE "public"."visitor_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."visitor_stats" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







RESET ALL;
