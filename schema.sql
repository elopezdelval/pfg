


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


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."eliminar_mensajes"("p_mensaje_id" integer, "p_usuario_id" integer) RETURNS "void"
    LANGUAGE "sql"
    AS $$
  UPDATE mensajes
  SET
    eliminado_remitente = CASE
      WHEN remitente_id = p_usuario_id THEN true
      ELSE eliminado_remitente
    END,
    eliminado_destinatario = CASE
      WHEN destinatario_id = p_usuario_id THEN true
      ELSE eliminado_destinatario
    END
  WHERE id = p_mensaje_id
    AND (remitente_id = p_usuario_id OR destinatario_id = p_usuario_id);
$$;


ALTER FUNCTION "public"."eliminar_mensajes"("p_mensaje_id" integer, "p_usuario_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."guardar_quedada"("p_datos" "jsonb", "p_region_id" integer, "p_distancia" numeric, "p_tipo_actividad" "text", "p_ritmo" "text", "p_descripcion" "text", "p_fecha" "timestamp", "p_creado_por" "text") RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
ruta_id int;
quedada_id int;
BEGIN
INSERT INTO rutas(datos, region_id, distancia)
VALUES (p_datos, p_region_id, p_distancia)
RETURNING id INTO ruta_id;


INSERT INTO quedadas(tipo_actividad, ritmo, descripcion, fecha, ruta_id, creado_por)
VALUES (p_tipo_actividad, p_ritmo, p_descripcion, p_fecha, ruta_id, (SELECT id FROM usuarios WHERE usuario = p_creado_por))
RETURNING id INTO quedada_id;


RETURN quedada_id;
END;
$$;


ALTER FUNCTION "public"."guardar_quedada"("p_datos" "jsonb", "p_region_id" integer, "p_distancia" numeric, "p_tipo_actividad" "text", "p_ritmo" "text", "p_descripcion" "text", "p_fecha" "timestamp", "p_creado_por" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."obtener_datos_usuario"("p_usuario_id" integer) RETURNS TABLE("usuario" "text", "nombre" "text", "email" "text", "fecha_nacimiento" "date", "codigo_pais" "text", "region_id" integer)
    LANGUAGE "sql"
    AS $$
  SELECT 
    u.usuario,
    u.nombre,
    u.email,
    u.fecha_nacimiento,
    r.codigo_pais,
    u.region_id
  FROM usuarios u
  LEFT JOIN regiones r ON u.region_id = r.id
  WHERE u.id = p_usuario_id;
$$;


ALTER FUNCTION "public"."obtener_datos_usuario"("p_usuario_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."obtener_mensajes"("p_usuario_id" integer) RETURNS TABLE("id" integer, "remitente_id" integer, "destinatario_id" integer, "asunto" "text", "cuerpo" "text", "fecha_envio" timestamp without time zone, "leido" boolean, "eliminado_remitente" boolean, "eliminado_destinatario" boolean, "remitente" "text", "destinatario" "text", "es_remitente" boolean, "es_destinatario" boolean)
    LANGUAGE "sql"
    AS $$
  SELECT 
    m.id,
    m.remitente_id,
    m.destinatario_id,
    m.asunto,
    m.cuerpo,
    m.fecha_envio,
    m.leido,
    m.eliminado_remitente,
    m.eliminado_destinatario,
    remitente.usuario AS remitente,
    destinatario.usuario AS destinatario,
    CASE WHEN m.remitente_id = p_usuario_id THEN true ELSE false END AS es_remitente,
    CASE WHEN m.destinatario_id = p_usuario_id THEN true ELSE false END AS es_destinatario
  FROM mensajes m
  JOIN usuarios remitente ON remitente.id = m.remitente_id
  JOIN usuarios destinatario ON destinatario.id = m.destinatario_id
  WHERE m.remitente_id = p_usuario_id OR m.destinatario_id = p_usuario_id
  ORDER BY m.fecha_envio DESC;
$$;


ALTER FUNCTION "public"."obtener_mensajes"("p_usuario_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."obtener_quedadas"("p_usuario_id" integer) RETURNS TABLE("id" integer, "actividad" "text", "region" "text", "distancia" numeric, "fecha_real" timestamp without time zone, "fecha" "text", "organizador" "text", "avatar_url" "text", "ritmo" "text", "descripcion" "text", "idruta" integer, "ruta" "jsonb", "usuario" "text", "apuntado" boolean)
    LANGUAGE "sql"
    AS $$
  select
    q.id,
    q.tipo_actividad,
    rg.nombre,
    rt.distancia,
    q.fecha,
    to_char(q.fecha, 'YYYY-MM-DD"T"HH24:MI:SS'),
    u.usuario,
    u.avatar_url,
    q.ritmo,
    q.descripcion,
    q.ruta_id,
    rt.datos,
    us.usuario,
    exists (
      select 1
      from usuarios_quedadas uq
      where uq.quedada_id = q.id
      and uq.usuario_id = p_usuario_id
    ) as apuntado
  from quedadas q
  join rutas rt on rt.id = q.ruta_id
  join regiones rg on rg.id = rt.region_id
  join usuarios u on u.id = q.creado_por
  join usuarios us on us.id = p_usuario_id
  order by q.fecha asc;
$$;


ALTER FUNCTION "public"."obtener_quedadas"("p_usuario_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."obtener_rutas"("p_usuario_id" integer) RETURNS TABLE("id" integer, "actividad" "text", "region_id" integer, "region" "text", "codigo_pais" "text", "distancia" numeric, "ruta" "jsonb", "guardada" boolean)
    LANGUAGE "sql"
    AS $$
  select
    rt.id,
    q.tipo_actividad,
    rg.id,
    rg.nombre,
    rg.codigo_pais,
    rt.distancia,
    rt.datos,
    exists (
      select 1
      from usuarios_rutas ur
      where ur.ruta_id = rt.id
      and ur.usuario_id = p_usuario_id
    ) as guardada
  from rutas rt
  join regiones rg on rg.id = rt.region_id
  join quedadas q on rt.id = q.ruta_id
$$;


ALTER FUNCTION "public"."obtener_rutas"("p_usuario_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."usuarios_apuntados"("p_quedada_id" integer) RETURNS TABLE("usuario" "text")
    LANGUAGE "sql"
    AS $$
  SELECT 
    u.usuario
  FROM usuarios_quedadas uq
  JOIN usuarios u ON u.id = uq.usuario_id
  WHERE uq.quedada_id = p_quedada_id;
$$;


ALTER FUNCTION "public"."usuarios_apuntados"("p_quedada_id" integer) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."mensajes" (
    "id" integer NOT NULL,
    "remitente_id" integer NOT NULL,
    "destinatario_id" integer NOT NULL,
    "asunto" "text" NOT NULL,
    "cuerpo" "text" NOT NULL,
    "fecha_envio" timestamp without time zone DEFAULT "now"() NOT NULL,
    "leido" boolean DEFAULT false NOT NULL,
    "eliminado_remitente" boolean DEFAULT false NOT NULL,
    "eliminado_destinatario" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."mensajes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."mensajes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."mensajes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."mensajes_id_seq" OWNED BY "public"."mensajes"."id";



CREATE TABLE IF NOT EXISTS "public"."paises" (
    "nombre" "text" NOT NULL,
    "codigo" "text" NOT NULL
);


ALTER TABLE "public"."paises" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quedadas" (
    "id" integer NOT NULL,
    "tipo_actividad" "text" NOT NULL,
    "ritmo" "text",
    "descripcion" "text",
    "fecha" timestamp without time zone NOT NULL,
    "ruta_id" integer NOT NULL,
    "creado_por" integer
);


ALTER TABLE "public"."quedadas" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."quedadas_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."quedadas_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."quedadas_id_seq" OWNED BY "public"."quedadas"."id";



CREATE TABLE IF NOT EXISTS "public"."recuperar_pass" (
    "id" integer NOT NULL,
    "usuario_id" integer NOT NULL,
    "token" "text" NOT NULL,
    "generado" timestamp without time zone DEFAULT "now"(),
    "valido_hasta" timestamp without time zone DEFAULT ("now"() + '00:15:00'::interval)
);


ALTER TABLE "public"."recuperar_pass" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."recuperar_pass_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."recuperar_pass_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."recuperar_pass_id_seq" OWNED BY "public"."recuperar_pass"."id";



CREATE TABLE IF NOT EXISTS "public"."regiones" (
    "id" integer NOT NULL,
    "nombre" "text" NOT NULL,
    "codigo_pais" "text" NOT NULL
);


ALTER TABLE "public"."regiones" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."regiones_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."regiones_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."regiones_id_seq" OWNED BY "public"."regiones"."id";



CREATE TABLE IF NOT EXISTS "public"."rutas" (
    "id" integer NOT NULL,
    "datos" "jsonb" NOT NULL,
    "region_id" integer,
    "distancia" numeric
);


ALTER TABLE "public"."rutas" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."rutas_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."rutas_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."rutas_id_seq" OWNED BY "public"."rutas"."id";



CREATE TABLE IF NOT EXISTS "public"."usuarios" (
    "id" integer NOT NULL,
    "usuario" "text" NOT NULL,
    "email" "text" NOT NULL,
    "pass" "text" NOT NULL,
    "nombre" "text" NOT NULL,
    "fecha_nacimiento" "date",
    "region_id" integer,
    "avatar_url" "text"
);


ALTER TABLE "public"."usuarios" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."usuarios_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."usuarios_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."usuarios_id_seq" OWNED BY "public"."usuarios"."id";



CREATE TABLE IF NOT EXISTS "public"."usuarios_quedadas" (
    "usuario_id" integer NOT NULL,
    "quedada_id" integer NOT NULL
);


ALTER TABLE "public"."usuarios_quedadas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."usuarios_rutas" (
    "usuario_id" integer NOT NULL,
    "ruta_id" integer NOT NULL
);


ALTER TABLE "public"."usuarios_rutas" OWNER TO "postgres";


ALTER TABLE ONLY "public"."mensajes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."mensajes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."quedadas" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."quedadas_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."recuperar_pass" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."recuperar_pass_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."regiones" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."regiones_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."rutas" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."rutas_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."usuarios" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."usuarios_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."mensajes"
    ADD CONSTRAINT "mensajes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."paises"
    ADD CONSTRAINT "paises_pkey" PRIMARY KEY ("codigo");



ALTER TABLE ONLY "public"."quedadas"
    ADD CONSTRAINT "quedadas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recuperar_pass"
    ADD CONSTRAINT "recuperar_pass_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."regiones"
    ADD CONSTRAINT "regiones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rutas"
    ADD CONSTRAINT "rutas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usuarios_quedadas"
    ADD CONSTRAINT "usuarios_quedadas_pkey" PRIMARY KEY ("usuario_id", "quedada_id");



ALTER TABLE ONLY "public"."usuarios_rutas"
    ADD CONSTRAINT "usuarios_rutas_pkey" PRIMARY KEY ("usuario_id", "ruta_id");



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_usuario_key" UNIQUE ("usuario");



ALTER TABLE ONLY "public"."mensajes"
    ADD CONSTRAINT "mensajes_destinatario_id_fkey" FOREIGN KEY ("destinatario_id") REFERENCES "public"."usuarios"("id");



ALTER TABLE ONLY "public"."mensajes"
    ADD CONSTRAINT "mensajes_remitente_id_fkey" FOREIGN KEY ("remitente_id") REFERENCES "public"."usuarios"("id");



ALTER TABLE ONLY "public"."quedadas"
    ADD CONSTRAINT "quedadas_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "public"."usuarios"("id");



ALTER TABLE ONLY "public"."quedadas"
    ADD CONSTRAINT "quedadas_ruta_id_fkey" FOREIGN KEY ("ruta_id") REFERENCES "public"."rutas"("id");



ALTER TABLE ONLY "public"."regiones"
    ADD CONSTRAINT "regiones_codigo_pais_fkey" FOREIGN KEY ("codigo_pais") REFERENCES "public"."paises"("codigo");



ALTER TABLE ONLY "public"."rutas"
    ADD CONSTRAINT "rutas_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "public"."regiones"("id");



ALTER TABLE ONLY "public"."usuarios_quedadas"
    ADD CONSTRAINT "usuarios_quedadas_quedada_id_fkey" FOREIGN KEY ("quedada_id") REFERENCES "public"."quedadas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usuarios_quedadas"
    ADD CONSTRAINT "usuarios_quedadas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "public"."regiones"("id");



ALTER TABLE ONLY "public"."usuarios_rutas"
    ADD CONSTRAINT "usuarios_rutas_ruta_id_fkey" FOREIGN KEY ("ruta_id") REFERENCES "public"."rutas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usuarios_rutas"
    ADD CONSTRAINT "usuarios_rutas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE;





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."eliminar_mensajes"("p_mensaje_id" integer, "p_usuario_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."eliminar_mensajes"("p_mensaje_id" integer, "p_usuario_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."eliminar_mensajes"("p_mensaje_id" integer, "p_usuario_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."guardar_quedada"("p_datos" "jsonb", "p_region_id" integer, "p_distancia" numeric, "p_tipo_actividad" "text", "p_ritmo" "text", "p_descripcion" "text", "p_fecha" "date", "p_creado_por" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."guardar_quedada"("p_datos" "jsonb", "p_region_id" integer, "p_distancia" numeric, "p_tipo_actividad" "text", "p_ritmo" "text", "p_descripcion" "text", "p_fecha" "date", "p_creado_por" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."guardar_quedada"("p_datos" "jsonb", "p_region_id" integer, "p_distancia" numeric, "p_tipo_actividad" "text", "p_ritmo" "text", "p_descripcion" "text", "p_fecha" "date", "p_creado_por" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."guardar_quedada"("p_datos" "jsonb", "p_region_id" integer, "p_distancia" numeric, "p_tipo_actividad" "text", "p_ritmo" "text", "p_descripcion" "text", "p_fecha" "date", "p_creado_por" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."guardar_quedada"("p_datos" "jsonb", "p_region_id" integer, "p_distancia" numeric, "p_tipo_actividad" "text", "p_ritmo" "text", "p_descripcion" "text", "p_fecha" "date", "p_creado_por" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."guardar_quedada"("p_datos" "jsonb", "p_region_id" integer, "p_distancia" numeric, "p_tipo_actividad" "text", "p_ritmo" "text", "p_descripcion" "text", "p_fecha" "date", "p_creado_por" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."obtener_datos_usuario"("p_usuario_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."obtener_datos_usuario"("p_usuario_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."obtener_datos_usuario"("p_usuario_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."obtener_mensajes"("p_usuario_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."obtener_mensajes"("p_usuario_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."obtener_mensajes"("p_usuario_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."obtener_quedadas"() TO "anon";
GRANT ALL ON FUNCTION "public"."obtener_quedadas"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."obtener_quedadas"() TO "service_role";



GRANT ALL ON FUNCTION "public"."obtener_quedadas"("p_usuario_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."obtener_quedadas"("p_usuario_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."obtener_quedadas"("p_usuario_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."obtener_rutas"("p_usuario_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."obtener_rutas"("p_usuario_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."obtener_rutas"("p_usuario_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."usuarios_apuntados"("p_quedada_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."usuarios_apuntados"("p_quedada_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."usuarios_apuntados"("p_quedada_id" integer) TO "service_role";


















GRANT ALL ON TABLE "public"."mensajes" TO "anon";
GRANT ALL ON TABLE "public"."mensajes" TO "authenticated";
GRANT ALL ON TABLE "public"."mensajes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."mensajes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."mensajes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."mensajes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."paises" TO "anon";
GRANT ALL ON TABLE "public"."paises" TO "authenticated";
GRANT ALL ON TABLE "public"."paises" TO "service_role";



GRANT ALL ON TABLE "public"."quedadas" TO "anon";
GRANT ALL ON TABLE "public"."quedadas" TO "authenticated";
GRANT ALL ON TABLE "public"."quedadas" TO "service_role";



GRANT ALL ON SEQUENCE "public"."quedadas_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."quedadas_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."quedadas_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."recuperar_pass" TO "anon";
GRANT ALL ON TABLE "public"."recuperar_pass" TO "authenticated";
GRANT ALL ON TABLE "public"."recuperar_pass" TO "service_role";



GRANT ALL ON SEQUENCE "public"."recuperar_pass_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."recuperar_pass_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."recuperar_pass_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."regiones" TO "anon";
GRANT ALL ON TABLE "public"."regiones" TO "authenticated";
GRANT ALL ON TABLE "public"."regiones" TO "service_role";



GRANT ALL ON SEQUENCE "public"."regiones_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."regiones_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."regiones_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."rutas" TO "anon";
GRANT ALL ON TABLE "public"."rutas" TO "authenticated";
GRANT ALL ON TABLE "public"."rutas" TO "service_role";



GRANT ALL ON SEQUENCE "public"."rutas_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."rutas_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."rutas_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."usuarios" TO "anon";
GRANT ALL ON TABLE "public"."usuarios" TO "authenticated";
GRANT ALL ON TABLE "public"."usuarios" TO "service_role";



GRANT ALL ON SEQUENCE "public"."usuarios_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."usuarios_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."usuarios_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."usuarios_quedadas" TO "anon";
GRANT ALL ON TABLE "public"."usuarios_quedadas" TO "authenticated";
GRANT ALL ON TABLE "public"."usuarios_quedadas" TO "service_role";



GRANT ALL ON TABLE "public"."usuarios_rutas" TO "anon";
GRANT ALL ON TABLE "public"."usuarios_rutas" TO "authenticated";
GRANT ALL ON TABLE "public"."usuarios_rutas" TO "service_role";









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































drop extension if exists "pg_net";
