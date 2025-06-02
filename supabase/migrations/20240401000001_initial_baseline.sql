

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



CREATE OR REPLACE FUNCTION "public"."check_opportunity_access"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$;


ALTER FUNCTION "public"."check_opportunity_access"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_application_notification"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Create notification for the brand when a new application is submitted
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      related_id
    )
    SELECT 
      o.brand_id,
      'New Application',
      'A new application has been submitted for ' || o.title,
      'new_application',
      NEW.id
    FROM public.opportunities o
    WHERE o.id = NEW.opportunity_id;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_application_notification"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_application_notification"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    brand_id text;
    opportunity_title text;
    run_club_name text;
    error_message text;
BEGIN
    -- Get the brand_id and opportunity title
    BEGIN
        SELECT o.brand_id, o.title INTO brand_id, opportunity_title
        FROM public.opportunities o
        WHERE o.id = NEW.opportunity_id;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Opportunity not found: %', NEW.opportunity_id;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        error_message := 'Error getting opportunity details: ' || SQLERRM;
        RAISE LOG '%', error_message;
        RETURN NEW;
    END;

    -- Get the run club name
    BEGIN
        SELECT rcp.club_name INTO run_club_name
        FROM public.run_club_profiles rcp
        WHERE rcp.id = NEW.run_club_id;
        
        IF NOT FOUND THEN
            RAISE LOG 'Run club profile not found for ID: %', NEW.run_club_id;
            run_club_name := 'Unknown Run Club';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        error_message := 'Error getting run club name: ' || SQLERRM;
        RAISE LOG '%', error_message;
        run_club_name := 'Unknown Run Club';
    END;

    -- Create notification for the brand
    BEGIN
        INSERT INTO public.notifications (
            user_id,
            title,
            message,
            type,
            related_id,
            read
        ) VALUES (
            brand_id,
            'New Application Received',
            run_club_name || ' has applied to "' || opportunity_title || '"',
            'new_application',
            NEW.id,
            false
        );
    EXCEPTION WHEN OTHERS THEN
        error_message := 'Error creating notification: ' || SQLERRM;
        RAISE LOG '%', error_message;
    END;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_application_notification"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- First create the base profile
  INSERT INTO public.profiles (id, user_type)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'user_type')
  ON CONFLICT (id) DO NOTHING;
  
  -- Then create the specific profile based on the user type
  IF NEW.raw_user_meta_data->>'user_type' = 'brand' THEN
    INSERT INTO public.brand_profiles (id, company_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'company_name')
    ON CONFLICT (id) DO NOTHING;
  ELSIF NEW.raw_user_meta_data->>'user_type' = 'run_club' THEN
    INSERT INTO public.run_club_profiles (id, club_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'club_name')
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the transaction
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."applications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "opportunity_id" "uuid" NOT NULL,
    "run_club_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "seen_by_brand" boolean DEFAULT false NOT NULL,
    CONSTRAINT "applications_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."applications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."brand_profiles" (
    "id" "uuid" NOT NULL,
    "company_name" "text",
    "industry" "text",
    "description" "text",
    "website" "text",
    "logo_url" "text",
    "social_media" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."brand_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chat_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "chat_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "sender_type" "text" NOT NULL,
    "content" "text" NOT NULL,
    "read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chat_messages_sender_type_check" CHECK (("sender_type" = ANY (ARRAY['brand'::"text", 'run_club'::"text"])))
);

ALTER TABLE ONLY "public"."chat_messages" REPLICA IDENTITY FULL;


ALTER TABLE "public"."chat_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chats" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "application_id" "uuid" NOT NULL,
    "opportunity_id" "uuid" NOT NULL,
    "brand_id" "uuid" NOT NULL,
    "run_club_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."chats" REPLICA IDENTITY FULL;


ALTER TABLE "public"."chats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "type" "text" NOT NULL,
    "related_id" "uuid",
    "read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."opportunities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "brand_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "primary_contact_name" "text",
    "primary_contact_email" "text",
    "phone_number" "text",
    "activation_overview" "text",
    "target_launch_date" "date",
    "primary_objective" "text",
    "primary_objective_other" "text",
    "content_specifications" "text",
    "professional_media" "text",
    "media_requirements" "text",
    "club_responsibilities" "text",
    "club_incentives" "text",
    "geographic_locations" "text"[],
    "club_size_preference" "text",
    "online_reach_preference" "text",
    "additional_notes" "text",
    "submission_deadline" "date" DEFAULT CURRENT_DATE NOT NULL
);


ALTER TABLE "public"."opportunities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "user_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "profiles_user_type_check" CHECK (("user_type" = ANY (ARRAY['brand'::"text", 'run_club'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."run_club_profiles" (
    "id" "uuid" NOT NULL,
    "club_name" "text",
    "description" "text",
    "location" "text",
    "member_count" integer DEFAULT 0,
    "website" "text",
    "logo_url" "text",
    "social_media" "jsonb" DEFAULT '{}'::"jsonb",
    "community_data" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."run_club_profiles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brand_profiles"
    ADD CONSTRAINT "brand_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chats"
    ADD CONSTRAINT "chats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."opportunities"
    ADD CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."run_club_profiles"
    ADD CONSTRAINT "run_club_profiles_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "on_application_created" AFTER INSERT ON "public"."applications" FOR EACH ROW EXECUTE FUNCTION "public"."handle_application_notification"();



CREATE OR REPLACE TRIGGER "on_application_updated" AFTER UPDATE ON "public"."applications" FOR EACH ROW EXECUTE FUNCTION "public"."handle_application_notification"();



CREATE OR REPLACE TRIGGER "on_new_application" AFTER INSERT ON "public"."applications" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_application_notification"();



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chats"
    ADD CONSTRAINT "chats_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chats"
    ADD CONSTRAINT "chats_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow all authenticated users to view brand profiles" ON "public"."brand_profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow all authenticated users to view opportunities" ON "public"."opportunities" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow all authenticated users to view run club profiles" ON "public"."run_club_profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow chat participants to update read status" ON "public"."chat_messages" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."chats"
  WHERE (("chats"."id" = "chat_messages"."chat_id") AND (("chats"."brand_id" = "auth"."uid"()) OR ("chats"."run_club_id" = "auth"."uid"()))))));



CREATE POLICY "Brands and run clubs can view opportunities" ON "public"."opportunities" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "brand_id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."user_type" = 'run_club'::"text"))))));



CREATE POLICY "Brands can delete their own opportunities" ON "public"."opportunities" FOR DELETE USING (("auth"."uid"() = "brand_id"));



CREATE POLICY "Brands can mark their opportunity applications as seen" ON "public"."applications" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."opportunities" "o"
  WHERE (("o"."id" = "applications"."opportunity_id") AND ("o"."brand_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."opportunities" "o"
  WHERE (("o"."id" = "applications"."opportunity_id") AND ("o"."brand_id" = "auth"."uid"())))));



CREATE POLICY "Brands can update application status" ON "public"."applications" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."opportunities"
  WHERE (("opportunities"."id" = "applications"."opportunity_id") AND ("opportunities"."brand_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."opportunities"
  WHERE (("opportunities"."id" = "applications"."opportunity_id") AND ("opportunities"."brand_id" = "auth"."uid"())))));



CREATE POLICY "Brands can update their own opportunities" ON "public"."opportunities" FOR UPDATE USING (("auth"."uid"() = "brand_id"));



CREATE POLICY "Brands can update their own profile" ON "public"."brand_profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Brands can view applications for their opportunities" ON "public"."applications" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."opportunities"
  WHERE (("opportunities"."id" = "applications"."opportunity_id") AND ("opportunities"."brand_id" = "auth"."uid"())))));



CREATE POLICY "Brands can view their own opportunities" ON "public"."opportunities" FOR SELECT USING (("auth"."uid"() = "brand_id"));



CREATE POLICY "Brands can view their own profile" ON "public"."brand_profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Enable delete for brand owners" ON "public"."opportunities" FOR DELETE TO "authenticated" USING (("brand_id" = "auth"."uid"()));



CREATE POLICY "Enable delete for run club owners" ON "public"."applications" FOR DELETE TO "authenticated" USING ((("run_club_id" = "auth"."uid"()) AND ("status" = 'pending'::"text")));



CREATE POLICY "Enable insert for authenticated brands" ON "public"."opportunities" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."user_type" = 'brand'::"text")))));



CREATE POLICY "Enable insert for authenticated run clubs" ON "public"."applications" FOR INSERT TO "authenticated" WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."user_type" = 'run_club'::"text")))) AND ("run_club_id" = "auth"."uid"())));



CREATE POLICY "Enable insert for run club owners" ON "public"."run_club_profiles" FOR INSERT TO "authenticated" WITH CHECK ((("id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."user_type" = 'run_club'::"text"))))));



CREATE POLICY "Enable read access for authenticated users" ON "public"."applications" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Enable read access for authenticated users" ON "public"."opportunities" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Enable read access for authenticated users" ON "public"."run_club_profiles" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Enable update for brand owners" ON "public"."applications" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."opportunities"
  WHERE (("opportunities"."id" = "applications"."opportunity_id") AND ("opportunities"."brand_id" = "auth"."uid"()))))) WITH CHECK ((("status" IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."opportunities"
  WHERE (("opportunities"."id" = "applications"."opportunity_id") AND ("opportunities"."brand_id" = "auth"."uid"()))))));



CREATE POLICY "Enable update for brand owners" ON "public"."opportunities" FOR UPDATE TO "authenticated" USING (("brand_id" = "auth"."uid"())) WITH CHECK (("brand_id" = "auth"."uid"()));



CREATE POLICY "Enable update for run club owners" ON "public"."run_club_profiles" FOR UPDATE TO "authenticated" USING ((("id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."user_type" = 'run_club'::"text"))))));



CREATE POLICY "Run clubs can delete their own pending applications" ON "public"."applications" FOR DELETE USING ((("auth"."uid"() = "run_club_id") AND ("status" = 'pending'::"text")));



CREATE POLICY "Run clubs can update their own profile" ON "public"."run_club_profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Run clubs can view their own applications" ON "public"."applications" FOR SELECT USING (("auth"."uid"() = "run_club_id"));



CREATE POLICY "Run clubs can view their own profile" ON "public"."run_club_profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert chats" ON "public"."chats" FOR INSERT TO "authenticated" WITH CHECK ((("brand_id" = "auth"."uid"()) OR ("run_club_id" = "auth"."uid"())));



CREATE POLICY "Users can insert messages in their chats" ON "public"."chat_messages" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."chats"
  WHERE (("chats"."id" = "chat_messages"."chat_id") AND (("chats"."brand_id" = "auth"."uid"()) OR ("chats"."run_club_id" = "auth"."uid"()))))));



CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can read messages in their chats" ON "public"."chat_messages" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."chats"
  WHERE (("chats"."id" = "chat_messages"."chat_id") AND (("chats"."brand_id" = "auth"."uid"()) OR ("chats"."run_club_id" = "auth"."uid"()))))));



CREATE POLICY "Users can read own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can read their own chats" ON "public"."chats" FOR SELECT TO "authenticated" USING ((("brand_id" = "auth"."uid"()) OR ("run_club_id" = "auth"."uid"())));



CREATE POLICY "Users can send messages in their own chats" ON "public"."chat_messages" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."chats"
  WHERE (("chats"."id" = "chat_messages"."chat_id") AND (("auth"."uid"() = "chats"."brand_id") OR ("auth"."uid"() = "chats"."run_club_id"))))));



CREATE POLICY "Users can update messages in their chats" ON "public"."chat_messages" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."chats"
  WHERE (("chats"."id" = "chat_messages"."chat_id") AND (("chats"."brand_id" = "auth"."uid"()) OR ("chats"."run_club_id" = "auth"."uid"()))))));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own chats" ON "public"."chats" FOR UPDATE TO "authenticated" USING ((("brand_id" = "auth"."uid"()) OR ("run_club_id" = "auth"."uid"())));



CREATE POLICY "Users can update their own notifications" ON "public"."notifications" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view messages in their own chats" ON "public"."chat_messages" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."chats"
  WHERE (("chats"."id" = "chat_messages"."chat_id") AND (("auth"."uid"() = "chats"."brand_id") OR ("auth"."uid"() = "chats"."run_club_id"))))));



CREATE POLICY "Users can view their own chats" ON "public"."chats" FOR SELECT USING ((("auth"."uid"() = "brand_id") OR ("auth"."uid"() = "run_club_id")));



CREATE POLICY "Users can view their own notifications" ON "public"."notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."applications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."brand_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chat_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."opportunities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."run_club_profiles" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."check_opportunity_access"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_opportunity_access"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_opportunity_access"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_application_notification"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_application_notification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_application_notification"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_application_notification"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_application_notification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_application_notification"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON TABLE "public"."applications" TO "anon";
GRANT ALL ON TABLE "public"."applications" TO "authenticated";
GRANT ALL ON TABLE "public"."applications" TO "service_role";



GRANT ALL ON TABLE "public"."brand_profiles" TO "anon";
GRANT ALL ON TABLE "public"."brand_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."brand_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."chat_messages" TO "anon";
GRANT ALL ON TABLE "public"."chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_messages" TO "service_role";



GRANT ALL ON TABLE "public"."chats" TO "anon";
GRANT ALL ON TABLE "public"."chats" TO "authenticated";
GRANT ALL ON TABLE "public"."chats" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."opportunities" TO "anon";
GRANT ALL ON TABLE "public"."opportunities" TO "authenticated";
GRANT ALL ON TABLE "public"."opportunities" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."run_club_profiles" TO "anon";
GRANT ALL ON TABLE "public"."run_club_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."run_club_profiles" TO "service_role";



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
