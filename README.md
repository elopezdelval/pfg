# Estructura del proyecto

Proyecto académico para la asignatura de proyecto final de DAW. El objetivo del proyecto es la creación de salidas deportivas (ciclismo, running, senderismo). Se van a utilizar leaflet y graphhopper para la edición de rutas en un mapa que se podrán añadir a las quedadas.

## Frontend (Vite js multipágina)

- Se utiliza vite como live server y bundler
- Múltiples entradas definidas en `vite.config.js`
- Cada página tiene un HTML con su JS
- Código compartido en `shared/`
- Dos archivos CSS uno para la página de presentación/login y otro para el resto
- El build genera `frontend/dist`, que servirá desde el back directamente por Express en producción

## Backend — (Node con express)

- Se sirve `frontend/dist` con `express.static` en producción, en desarrollo se utiliza como servidor proxy
- Conexión a bbdd externalizada en supabase.com
- Se va a organizar el backend en bbdd, autenticacion (que son los elementos reutilizables) y endpoints de lógica de negocio
- Autenticación JWT
- Validación de acceso y control de sesión a través de cookies

## Base de datos

- PostgreSQL. Se utiliza el dominio supabase, que ofrece plan gratuito con suficiente almacenamiento tanto para la base de datos como para los avatares de usuario
- Tablas principales rutas, usuarios, quedadas.
- Tablas de relación usuarios-quedadas, usuarios-rutas
- Tablas secundarias regiones, paises (para cargar en selector de provincias/regiones)

## Empaquetado, despliegue

En caso de tener tiempo se intentará empaquetar con docker y desplegar en algún host con plan gratuito simulando entorno de producción real.

# Lógica de mapas

- Se usa leaflet para renderizar los mapas y pintar las rutas. Se utilizan capas diferentes en función del deporte seleccionado que resltan en el mapa caminos/carriles bici/nada. Es una librería de código abierto.
- Se usa el servicio externo graphhopper para el cálculo de las rutas. Optimiza la ruta en función del perfil seleccionado (en coche, a pie o en bicicleta en el plan gratuito). Tiene un plan gratuito de 500 peticiones diarias, suficiente para desarrollo y testing. Una vez guardada una ruta no es necesario realizar más consultas a graphhopper dado que se almacenan las coordenadas de los puntos necesarios para pintar la ruta en la base de datos.

# Instrucciones de uso

Para levantar el proyecto en modo desarrollo, se deben instalar las dependencias en la raiz, en el directorio backend y en el directorio frontend y ejecutar desde la raiz:
```
npm run dev
```
la aplicación quedará corriendo en http://localhost:5173/



Para levantar el proyecto en modo producción, primero se debe hacer el build del front ejecutando
```
npm run build
```
desde el directorio /frontend
Luego se deben descomentar las líneas 29-37 del archivo server.js en el directorio backend y posteriormente ejecutar el docker-compose
```
docker-compose up
```
la aplicación quedará corriendo en http://localhost:3000/