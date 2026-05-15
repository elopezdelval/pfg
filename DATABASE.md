# Base de datos

La aplicación utiliza PostgreSQL desplegado en Supabase como base de datos.

Además de PostgreSQL, también se utiliza Supabse para almacenar los avatares.

## Esquema versionado

La estructura SQL del proyecto (tablas, funciones, etc) está versionada en el repositorio mediante el archivo 

**`schema.sql`**

La migración permite recrear la base de datos en otro entorno.

## Tablas principales

* **usuarios**: almacena las credenciales, los datos de perfil, la región y la URL del avatar.
* **rutas**: guarda las rutas generadas, incluyendo coordenadas.
* **quedadas**: registra las actividades publicadas por los usuarios.
* **mensajes**: almacena los mensajes que se envían los usuarios.

## Tablas de relación

* **usuarios_quedadas**: relaciona usuarios con las quedadas a las que se apuntan.
* **usuarios_rutas**: relaciona usuarios con rutas que hayan guardado.

## Tablas auxiliares

* **regiones** y **paises**: sirven para cargar los datos en los selectores del frontend.
* **recuperar_pass**: guarda token, usuario y fecha/hora de validez para el cambio de contraseña.

## Funciones SQL usadas por el backend

Para dejar más limpio el backend, para las consultas complejas se utilizan funciones SQL definidas en la base de datos:

* **obtener_datos_usuario(id_usuario)**
* **guardar_quedada(ruta, region, distancia, actividad, ritmo, descripcion, fecha, usuario)**
* **obtener_quedadas(id_usuario)**
* **obtener_rutas(id_usuario)**
* **obtener_mensajes(id_usuario)**
* **eliminar_mensajes(id_mensaje, id_usuario)**
* **usuarios_apuntados(quedada_id)**

Para que el proyecto funcione en otro entorno hay que recrear también estas funciones.

## Avatares en Supabase Storage

Los avatares no se guardan directamente dentro de PostgreSQL.

Se utiliza el almacenamiento de Supabase en un directorio **Avatares** y en la tabla **usuarios** se guarda la URL pública del archivo a la que se puede acceder directamente desde el frontend.

## Reproducir la base de datos en otro entorno

El esquema facilitado permite reproducir la estructura de la base de datos con tablas y funciones.

Para levantarla en otro entorno hace falta:

* crear un proyecto nuevo en Supabase
* aplicar el esquema de **schema.sql**
* Introducir en el **.env** las credenciales propias
* crear un bucket público **Avatares**
* cargar datos base de las regiones que se quiera presentar en **paises** y **regiones**