# Proyecto final DAW — Plataforma de salidas deportivas

Proyecto Final de DAW.

Aplicación web para organización de actividades deportivas (ciclismo, running y senderismo) con creación de rutas interactivas y gestión de quedadas.

Incluye autenticación JWT, persistencia de rutas geográficas, integración con APIs externas y despliegue dockerizado.

Demo disponible en **https://pfg-pvjz.onrender.com**

---

## Stack

* Frontend: Vite, JavaScript, Leaflet
* Backend: Node.js, Express
* Base de datos: PostgreSQL (Supabase)
* Autenticación: JWT + cookies httpOnly
* Despliegue: Docker + Render
* API externa: Graphhopper

---

## Funcionalidades

* Registro e inicio de sesión
* Recuperación de contraseña
* Perfil de usuario con edición de datos personales
* Cambio de contraseña desde el perfil
* Subida y actualización de avatar
* Creación y reutilización de rutas deportivas
* Guardado y eliminación de rutas en la actividad personal
* Creación de quedadas deportivas
* Inscripción y baja en quedadas
* Sistema de mensajería interna entre usuarios
* Bandejas de mensajes recibidos, enviados y eliminados
* Marcado de mensajes como leídos y borrado lógico
* Renderizado de rutas en mapas interactivos
* Control de acceso mediante JWT y cookies

---

## Arquitectura

La aplicación sigue una arquitectura cliente-servidor dividida en frontend, backend y base de datos. El frontend está desarrollado con Vite y JavaScript vanilla en formato multipágina, el backend con Node.js y Express expone la API REST y gestiona la autenticación mediante JWT en cookies httpOnly, y la persistencia se apoya en PostgreSQL en Supabase. Además, Supabase Storage se utiliza para los avatares y Graphhopper para el cálculo de rutas.

* `Frontend`: interfaz multipágina y renderizado de mapas con Leaflet
* `Backend`: lógica de negocio, autenticación y endpoints REST
* `Base de datos`: persistencia relacional y funciones SQL auxiliares
* `Servicios externos`: Graphhopper para rutas y Supabase Storage para avatares

---

## Frontend

Frontend desarrollado con Vite en arquitectura multipágina.

* Múltiples entradas definidas en vite.config.js
* Cada página dispone de su propio HTML y JS
* Código compartido organizado en shared/

Se utiliza Leaflet para renderizar mapas y mostrar rutas deportivas sobre distintas capas según el deporte seleccionado.

---

## Backend

Backend desarrollado con Node.js y Express.

* API REST para lógica de negocio
* Uso de proxy en entorno de desarrollo
* Organización separada de autenticación, base de datos y endpoints

#### Autenticación

* JWT almacenado en cookies httpOnly
* Validación de acceso y control de sesión
* Recuperación de contraseña mediante envío de correo

---

## Base de datos

La base de datos PostgreSQL está desplegada en Supabase.

La documentación detallada de la estructura, tablas, funciones SQL y almacenamiento de avatares se encuentra en [DATABASE.md](./DATABASE.md).

---

## Integración de mapas y rutas

### Leaflet

Se utiliza Leaflet para:

* renderizar mapas
* mostrar rutas
* gestionar capas según el tipo de actividad

### Graphhopper

Se utiliza Graphhopper para el cálculo de rutas.

El servicio permite generar recorridos optimizados según el perfil seleccionado:

* a pie
* bicicleta
* coche

---

## Despliegue

La aplicación se encuentra dockerizada y desplegada en Render utilizando el plan gratuito.

Limitaciones actuales del despliegue:

* cold starts de aproximadamente 40 segundos tras periodos de inactividad de más de 15min
* restricción al uso de SMTP en el plan gratuito de render para envío de correos
* dependencia de API externa para la creación de rutas con límite de peticiones en plan gratuito de graphhopper

La funcionalidad de recuperación de contraseña está implementada y funciona correctamente en entorno local utilizando variables de entorno SMTP.

---

## Decisiones técnicas

#### Persistencia de rutas

Las coordenadas generadas por Graphhopper se almacenan en base de datos para reducir llamadas a la API y limitar la dependencia de los límites del plan gratuito.

#### Arquitectura multipágina

Se optó por una arquitectura con JavaScript vanilla para centrar el proyecto en la lógica de la aplicación y evitar complejidad adicional en el desarrollo del frontend añadiendo un framework. Como evolución natural, una versión futura podría migrar el cliente a React para mejorar la reutilización de componentes y estados.

#### Autenticación

La autenticación se resolvió con JWT en cookies httpOnly para gestionar la sesión de forma sencilla sin necesidad de pasar por la base de datos.

#### Lógica SQL

Parte de la lógica de consulta se trasladó a funciones SQL para mantener los endpoints del backend más limpios.

---

## Configuración y ejecución

### Requisitos previos

Para levantar el proyecto es necesario disponer de:

* Node.js 22 o compatible
* npm
* Un proyecto de Supabase con base de datos PostgreSQL accesible
* Un bucket público `Avatares` en Supabase Storage
* Una API key de Graphhopper
* Una cuenta SMTP compatible con Nodemailer para la recuperación de contraseña

### Variables de entorno

El backend carga sus variables desde `backend/.env`.

Existe una plantilla en `backend/.env.example` con valores de ejemplo para configurar el entorno local.

Variables necesarias:

* `NODE_ENV`: modo de ejecución del backend (`development` o `production`)
* `GRAPHHOPPER`: API key usada para calcular rutas
* `PORT`: puerto en el que escucha Express
* `DB_URL`: cadena de conexión a PostgreSQL
* `SECRETO_JWT`: secreto para firmar y verificar los tokens JWT
* `SUPABASE_URL`: URL del proyecto de Supabase
* `SUPABASE_SERVICE_ROLE`: clave de servicio usada para subir avatares a Storage
* `SMTP_USER`: cuenta de correo usada para enviar emails
* `SMTP_PASS`: contraseña o app password de la cuenta SMTP

### Ejecución en desarrollo

Instalar dependencias en:

* la raíz del proyecto
* `frontend/`
* `backend/`

Ejecutar desde la raíz:
```bash
npm run dev
```

Esto lanza:

* Vite en `http://localhost:5173`
* Express en `http://localhost:3000`

En desarrollo, el backend se ejecuta con `NODE_ENV=development` y actúa solo como API. Vite redirige las peticiones `/api` al backend mediante proxy.

### Ejecución en producción

Generar antes el build del frontend:
```bash
cd frontend
npm run build
```

Levantar contenedores desde la raíz:
```bash
docker-compose up
```

La aplicación quedará disponible en `http://localhost:3000`.

En producción, el contenedor arranca con `NODE_ENV=production` y Express sirve el contenido generado en `frontend/dist`.
