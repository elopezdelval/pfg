# Descripción y objetivo del proyecto

Proyecto académico para la asignatura de proyecto final de DAW. El objetivo del proyecto es la creación de un sitio web tipo red social de salidas deportivas (ciclismo, running, senderismo). El eje central es la origanización de quedadas lúdicas a las que cualquiera puede apuntarse.
- - -
# Estructura
## Frontend (Vite js multipágina)

- Se utiliza vite como live server y bundler
- Múltiples entradas definidas en `vite.config.js`
- Cada página tiene un HTML con su JS
- Código compartido en `shared/`
- Dos archivos CSS uno para la página de presentación/login y otro para el resto
- El build genera `frontend/dist`, que se servirá desde el back directamente por Express en producción

## Backend — (Node con express)

- Se sirve `frontend/dist` con `express.static` en producción, en desarrollo se utiliza como servidor proxy
- Conexión a bbdd externalizada en supabase.com
- Se organiza el backend en bbdd, autenticación, errores y endpoints de lógica de negocio
- Autenticación JWT
- Validación de acceso y control de sesión a través de cookies

## Base de datos

- PostgreSQL.
- Tablas principales rutas, usuarios, quedadas y mensajes.
- Tablas de relación usuarios-quedadas, usuarios-rutas
- Tablas secundarias regiones, paises (para cargar en selector de provincias/regiones)

# Tecnologías

## Frontend
- **Vite** — Build tool y servidor de desarrollo
- **Leaflet** — Librería open source para mapas interactivos
- **Vanilla JS** — Sin framework, módulos ES

## Backend
- **Node.js** — Entorno de ejecución
- **Express** — Framework web
- **pg** — Cliente PostgreSQL
- **jsonwebtoken** — Autenticación JWT
- **bcrypt** — Hash de contraseñas
- **cookie-parser** — Gestión de cookies
- **multer** — Subida de archivos
- **dotenv** — Variables de entorno
- **Leaflet** — Mapas (servido desde backend)
- **nodemon** — Recarga automática en desarrollo

## Servicios externos
- **Supabase** — PostgreSQL + almacenamiento (plan gratuito)
- **GraphHopper** — API para cálculo y optimización de rutas (500 peticiones/día gratis)

## Despliegue
- **Docker** — Contenedores
- **Render** — Hosting (plan gratuito con cold start ~40s)

# Lógica de mapas

- Se usa leaflet para renderizar los mapas y pintar las rutas. Se utilizan capas diferentes en función del deporte seleccionado que resltan en el mapa caminos/carriles bici/nada. Es una librería de código abierto.
- Se usa el servicio externo graphhopper para el cálculo y optimización de las rutas. La ruta se calcula en función del perfil seleccionado (en coche, a pie o en bicicleta en el plan gratuito). Tiene un plan gratuito de 500 peticiones diarias, suficiente para desarrollo y testing. Una vez guardada una ruta no es necesario realizar más consultas a graphhopper dado que se almacenan las coordenadas de los puntos necesarios para pintar la ruta desde la base de datos.

# Instrucciones de uso

## Requisitos previos

- Node.js (v18+)
- Docker y Docker Compose

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con la siguiente estructura:

```env
# Puerto del servidor
PORT=3000

# Secret para JWT (genera una cadena aleatoria segura)
SECRETO_JWT=tu_secret_aqui_cuanto_mas_largo_mejor

# Supabase (obtén tus credenciales en supabase.com)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_api_key_anónyma
```

### Modo producción
Para levantar el proyecto localmente, primero se debe hacer el build del front ejecutando
```bash
cd frontend
npm run build
```
Luego simplemente se ejecuta docker-compose desde la raíz
```bash
docker-compose up
```
la aplicación quedará corriendo en http://localhost:3000/
### Modo desarrollo

Para ejecutar en modo desarrollo comenta las lineas 33-41 de server.js y ejecuta desde la raiz
```
npm run dev
```
La aplicación quedará corriendo en http://localhost:5173/
### Despliegue
Para simular un entorno de producción real, se ha empaquetado la aplicación con docker y se ha desplegado en el servicio de hosting render.com (dado que es un proyecto académico se ha optado por la opción gratuita que penaliza con un cold start de unos 40s cuando la página que da inactiva más de 15min).

Se puede probar el proyecto en https://pfg-pvjz.onrender.com
