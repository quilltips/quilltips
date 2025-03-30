

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


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "wrappers" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."public_profiles" (
    "id" "uuid" NOT NULL,
    "name" "text",
    "bio" "text",
    "avatar_url" "text",
    "social_links" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."public_profiles" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_public_profile_by_id"("profile_id" "uuid") RETURNS SETOF "public"."public_profiles"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT * FROM public_profiles WHERE id = profile_id;
$$;


ALTER FUNCTION "public"."get_public_profile_by_id"("profile_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_public_profile_by_name"("profile_name" "text") RETURNS SETOF "public"."public_profiles"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT * FROM public_profiles WHERE name ILIKE profile_name;
$$;


ALTER FUNCTION "public"."get_public_profile_by_name"("profile_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, name, bio, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', new.email),
    new.raw_user_meta_data->>'bio',
    COALESCE(new.raw_user_meta_data->>'role', 'reader')
  );
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."insert_public_profile"("profile_id" "uuid", "profile_name" "text", "profile_bio" "text", "profile_avatar_url" "text", "profile_social_links" "jsonb") RETURNS "void"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  INSERT INTO public_profiles (id, name, bio, avatar_url, social_links)
  VALUES (profile_id, profile_name, profile_bio, profile_avatar_url, profile_social_links);
$$;


ALTER FUNCTION "public"."insert_public_profile"("profile_id" "uuid", "profile_name" "text", "profile_bio" "text", "profile_avatar_url" "text", "profile_social_links" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_profile_to_public_profile"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- For insert or update operations
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    -- Check if a record already exists in public_profiles
    IF EXISTS (SELECT 1 FROM public_profiles WHERE id = NEW.id) THEN
      -- Update existing record
      UPDATE public_profiles
      SET
        name = NEW.name,
        bio = NEW.bio,
        avatar_url = NEW.avatar_url,
        social_links = NEW.social_links
      WHERE id = NEW.id;
    ELSE
      -- Insert new record
      INSERT INTO public_profiles (id, name, bio, avatar_url, social_links)
      VALUES (NEW.id, NEW.name, NEW.bio, NEW.avatar_url, NEW.social_links);
    END IF;
    RETURN NEW;
  
  -- For delete operations
  ELSIF (TG_OP = 'DELETE') THEN
    -- Delete the corresponding public profile
    DELETE FROM public_profiles WHERE id = OLD.id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."sync_profile_to_public_profile"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_public_profile"("profile_id" "uuid", "profile_name" "text", "profile_bio" "text", "profile_avatar_url" "text", "profile_social_links" "jsonb") RETURNS "void"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  UPDATE public_profiles
  SET 
    name = profile_name,
    bio = profile_bio,
    avatar_url = profile_avatar_url,
    social_links = profile_social_links
  WHERE id = profile_id;
$$;


ALTER FUNCTION "public"."update_public_profile"("profile_id" "uuid", "profile_name" "text", "profile_bio" "text", "profile_avatar_url" "text", "profile_social_links" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_qr_code_stats"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Update the QR code statistics for the specific QR code
  UPDATE qr_codes
  SET 
    total_tips = (
      SELECT COUNT(*)
      FROM tips
      WHERE qr_code_id = NEW.qr_code_id
    ),
    total_amount = (
      SELECT COALESCE(SUM(amount), 0)
      FROM tips
      WHERE qr_code_id = NEW.qr_code_id
    ),
    average_tip = (
      SELECT COALESCE(AVG(amount), 0)
      FROM tips
      WHERE qr_code_id = NEW.qr_code_id
    ),
    last_tip_date = NEW.created_at
  WHERE id = NEW.qr_code_id;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_qr_code_stats"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "name" "text",
    "bio" "text",
    "role" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "stripe_account_id" "text",
    "avatar_url" "text",
    "social_links" "jsonb" DEFAULT '[]'::"jsonb",
    "stripe_setup_complete" boolean DEFAULT false,
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['author'::"text", 'reader'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."qr_codes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "author_id" "uuid" NOT NULL,
    "book_title" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "is_paid" boolean DEFAULT false NOT NULL,
    "stripe_session_id" "text",
    "publisher" "text",
    "isbn" "text",
    "release_date" "date",
    "cover_image" "text",
    "total_tips" integer DEFAULT 0,
    "total_amount" numeric(10,2) DEFAULT 0.00,
    "average_tip" numeric(10,2) DEFAULT 0.00,
    "last_tip_date" timestamp with time zone,
    "qr_code_image_url" "text",
    "template" "text" DEFAULT 'basic'::"text" NOT NULL,
    "qr_code_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "uniqode_qr_code_id" "text",
    "framed_qr_code_image_url" "text"
);


ALTER TABLE "public"."qr_codes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tip_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tip_id" "uuid" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."tip_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tip_likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tip_id" "uuid" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."tip_likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tips" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "author_id" "uuid" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "message" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "book_title" "text",
    "qr_code_id" "uuid",
    "stripe_session_id" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "reader_name" "text",
    "reader_avatar_url" "text"
);


ALTER TABLE "public"."tips" OWNER TO "postgres";


ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."public_profiles"
    ADD CONSTRAINT "public_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."qr_codes"
    ADD CONSTRAINT "qr_codes_isbn_unique" UNIQUE ("isbn");



ALTER TABLE ONLY "public"."qr_codes"
    ADD CONSTRAINT "qr_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tip_comments"
    ADD CONSTRAINT "tip_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tip_likes"
    ADD CONSTRAINT "tip_likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tip_likes"
    ADD CONSTRAINT "tip_likes_tip_id_author_id_key" UNIQUE ("tip_id", "author_id");



ALTER TABLE ONLY "public"."tips"
    ADD CONSTRAINT "tips_pkey" PRIMARY KEY ("id");



CREATE INDEX "tips_stripe_session_id_idx" ON "public"."tips" USING "btree" ("stripe_session_id");



CREATE OR REPLACE TRIGGER "sync_profile_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."sync_profile_to_public_profile"();



CREATE OR REPLACE TRIGGER "update_qr_code_stats_after_tip" AFTER INSERT ON "public"."tips" FOR EACH ROW EXECUTE FUNCTION "public"."update_qr_code_stats"();



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."public_profiles"
    ADD CONSTRAINT "public_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."qr_codes"
    ADD CONSTRAINT "qr_codes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."tip_comments"
    ADD CONSTRAINT "tip_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."tip_comments"
    ADD CONSTRAINT "tip_comments_tip_id_fkey" FOREIGN KEY ("tip_id") REFERENCES "public"."tips"("id");



ALTER TABLE ONLY "public"."tip_likes"
    ADD CONSTRAINT "tip_likes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."tip_likes"
    ADD CONSTRAINT "tip_likes_tip_id_fkey" FOREIGN KEY ("tip_id") REFERENCES "public"."tips"("id");



ALTER TABLE ONLY "public"."tips"
    ADD CONSTRAINT "tips_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."tips"
    ADD CONSTRAINT "tips_qr_code_id_fkey" FOREIGN KEY ("qr_code_id") REFERENCES "public"."qr_codes"("id");



CREATE POLICY "Anyone can create tips" ON "public"."tips" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authors can comment on tips" ON "public"."tip_comments" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."tips"
  WHERE (("tips"."id" = "tip_comments"."tip_id") AND ("tips"."author_id" = "auth"."uid"())))));



CREATE POLICY "Authors can create their own QR codes" ON "public"."qr_codes" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "author_id"));



CREATE POLICY "Authors can like tips" ON "public"."tip_likes" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."tips"
  WHERE (("tips"."id" = "tip_likes"."tip_id") AND ("tips"."author_id" = "auth"."uid"())))));



CREATE POLICY "Authors can view comments on their tips" ON "public"."tip_comments" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."tips"
  WHERE (("tips"."id" = "tip_comments"."tip_id") AND ("tips"."author_id" = "auth"."uid"())))));



CREATE POLICY "Authors can view likes on their tips" ON "public"."tip_likes" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."tips"
  WHERE (("tips"."id" = "tip_likes"."tip_id") AND ("tips"."author_id" = "auth"."uid"())))));



CREATE POLICY "Authors can view their own QR codes" ON "public"."qr_codes" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "author_id"));



CREATE POLICY "Authors can view their received tips" ON "public"."tips" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "author_id"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Enable read access for all users" ON "public"."profiles" FOR SELECT TO "authenticated", "anon", "authenticator" USING (true);



CREATE POLICY "Profiles are viewable by everyone" ON "public"."profiles" FOR SELECT TO "authenticated", "authenticator" USING (true);



CREATE POLICY "Public profiles are viewable by everyone" ON "public"."public_profiles" FOR SELECT USING (true);



CREATE POLICY "QR codes are viewable by everyone" ON "public"."qr_codes" FOR SELECT USING (true);



CREATE POLICY "Users can delete their own public profile" ON "public"."public_profiles" FOR DELETE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert their own profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert their own public profile" ON "public"."public_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own avatar" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own public profile" ON "public"."public_profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own stripe account" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."public_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."qr_codes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tip_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tip_likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tips" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";









































































































































































































































































































GRANT ALL ON TABLE "public"."public_profiles" TO "anon";
GRANT ALL ON TABLE "public"."public_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."public_profiles" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_public_profile_by_id"("profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_public_profile_by_id"("profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_public_profile_by_id"("profile_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_public_profile_by_name"("profile_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_public_profile_by_name"("profile_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_public_profile_by_name"("profile_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."insert_public_profile"("profile_id" "uuid", "profile_name" "text", "profile_bio" "text", "profile_avatar_url" "text", "profile_social_links" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."insert_public_profile"("profile_id" "uuid", "profile_name" "text", "profile_bio" "text", "profile_avatar_url" "text", "profile_social_links" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_public_profile"("profile_id" "uuid", "profile_name" "text", "profile_bio" "text", "profile_avatar_url" "text", "profile_social_links" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_profile_to_public_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_profile_to_public_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_profile_to_public_profile"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_public_profile"("profile_id" "uuid", "profile_name" "text", "profile_bio" "text", "profile_avatar_url" "text", "profile_social_links" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_public_profile"("profile_id" "uuid", "profile_name" "text", "profile_bio" "text", "profile_avatar_url" "text", "profile_social_links" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_public_profile"("profile_id" "uuid", "profile_name" "text", "profile_bio" "text", "profile_avatar_url" "text", "profile_social_links" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_qr_code_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_qr_code_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_qr_code_stats"() TO "service_role";





















GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."qr_codes" TO "anon";
GRANT ALL ON TABLE "public"."qr_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."qr_codes" TO "service_role";



GRANT ALL ON TABLE "public"."tip_comments" TO "anon";
GRANT ALL ON TABLE "public"."tip_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."tip_comments" TO "service_role";



GRANT ALL ON TABLE "public"."tip_likes" TO "anon";
GRANT ALL ON TABLE "public"."tip_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."tip_likes" TO "service_role";



GRANT ALL ON TABLE "public"."tips" TO "anon";
GRANT ALL ON TABLE "public"."tips" TO "authenticated";
GRANT ALL ON TABLE "public"."tips" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
