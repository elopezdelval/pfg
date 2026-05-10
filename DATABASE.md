# Base de datos

La aplicación utiliza PostgreSQL desplegado en Supabase como base de datos.

Además del motor PostgreSQL, Supabase también se utiliza para el almacenamiento de avatares.

## Esquema versionado

La estructura SQL del proyecto está versionada en el repositorio mediante el archivo 

**schema.sql**

Esta migración permite recrear la estructura de la base de datos en otro entorno con credenciales propias.

## Tablas principales

* **usuarios**: almacena credenciales, datos de perfil, región y URL del avatar.
* **rutas**: guarda rutas generadas, incluyendo distancia y coordenadas persistidas.
* **quedadas**: registra las actividades publicadas por los usuarios.
* **mensajes**: almacena la mensajería interna entre usuarios.

## Tablas de relación

* **usuarios_quedadas**: relaciona usuarios con las quedadas a las que se apuntan.
* **usuarios_rutas**: relaciona usuarios con rutas guardadas.

## Tablas auxiliares

* **regiones** y **paises**: alimentan los selectores geográficos del frontend.
* **recuperar_pass**: guarda los tokens temporales de recuperación de contraseña.

## Funciones SQL usadas por el backend

El backend no depende solo de tablas. También utiliza funciones SQL ya definidas en la base de datos:

* **obtener_datos_usuario(id_usuario)**
* **guardar_quedada(ruta, region, distancia, actividad, ritmo, descripcion, fecha, usuario)**
* **obtener_quedadas(id_usuario)**
* **obtener_rutas(id_usuario)**
* **obtener_mensajes(id_usuario)**
* **eliminar_mensajes(id_mensaje, id_usuario)**

Estas funciones encapsulan parte importante de la lógica de lectura y escritura. Para reproducir el proyecto en otro entorno hay que recrear estas funciones.

## Avatares en Supabase Storage

Los avatares no se guardan dentro de PostgreSQL.

Se almacenan en un bucket público llamado **Avatares** en Supabase Storage y en la tabla **usuarios** se persiste la URL pública del archivo.

## Dependencias externas

Para que la base de datos funcione correctamente en un entorno nuevo, como mínimo hay que preparar:

* una base PostgreSQL accesible desde el backend
* las tablas anteriores
* las funciones SQL utilizadas por el backend
* el bucket **Avatares** en Supabase Storage

## Reproducir la base de datos en otro entorno

El repositorio permite reproducir la estructura de la base de datos, pero no clona automáticamente todo el proyecto real de Supabase.

Para levantarla en otro entorno hace falta:

* crear un proyecto nuevo en Supabase
* aplicar el esquema de **schema.sql**
* configurar en el **.env** las credenciales propias
* crear un bucket público **Avatares**
* cargar datos base de las regiones que se quiera presentar en **paises** y **regiones**
