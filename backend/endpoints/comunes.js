import { createError } from "../errors/AppError.js";

export default function endpointsComunes(app, db) {

    //endpoint para obtener los paises de la base de datos

    app.get('/api/obtenerPaises', (req, res, next) => {
        db.query('SELECT codigo, nombre FROM paises')
        .then(paises => {    
            res.json(paises.rows)
        })
        .catch(next)
    })

    //endpoint para obtener las provincias de la base de datos

    app.get('/api/obtenerRegiones', (req, res, next) => {
        const pais = req.query.pais;

        //obtenemos el nombre para el listado y la id para el value del desplegable que hay en el front

        db.query(`SELECT id, nombre, codigo_pais FROM regiones WHERE codigo_pais = $1`, [pais])
            .then(regiones => {
                res.json(regiones.rows)
            })
            .catch(next)
    })

    //endpoint para sacar la ruta a seguir entre dos puntos de graphhopper

    app.post('/api/rutaGraphhopper', (req, res, next) => {
        const apikey = process.env.GRAPHHOPPER;

        //sacamos la informaciónn del body de la petición y construimos la url con la que vamos a hacer la consulta a GH
        
        const entrada = req.body;
        const url = `https://graphhopper.com/api/1/route?point=${entrada.inicio.lat},${entrada.inicio.lng}&point=${entrada.fin.lat},${entrada.fin.lng}&profile=${entrada.perfil}&calc_points=true&points_encoded=false&instructions=false&optimize=false&key=${apikey}`;

        fetch(url)
        .then(r => {
            if (!r.ok) {
                throw createError(502, "EXTERNAL_SERVICE_ERROR", "Error obteniendo la ruta");
            }
            return r.json();
        })
        .then(datos => {
            
            //Saco la distancia y las coordenadas, y las coordenadas las invierto ya que graphhopper los da en [lng, lat] y leaflet los necesita como [lat, lng]

            const distancia = datos.paths[0].distance;
            const coordenadas = datos.paths[0].points.coordinates.map(coord => [coord[1], coord[0]])

            const respuesta = {
                distancia: distancia,
                coordenadas: coordenadas
            }
            res.json(respuesta);
        })
        .catch(next)
    })

    //endpoint para cargar avatares

    app.get('/api/auth/urlAvatar', (req, res, next) => {
        const usuarioId = req.usuario.id;
        const id = req.query.id;

        if (id === undefined || id === "undefined") {
            db.query('SELECT avatar_url FROM usuarios WHERE id = $1', [usuarioId])
            .then(url => {
                res.json(url.rows)
            })
            .catch(next)
        } else {
            db.query('SELECT avatar_url FROM usuarios WHERE id = $1', [id])
            .then(url => {
                res.json(url.rows)
            })
            .catch(next)
        }
    })
}
