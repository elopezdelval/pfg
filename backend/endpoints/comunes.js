export default function endpointsComunes(app, db) {

    //endpoint para obtener los paises de la base de datos

    app.get('/api/obtenerPaises', (req, res) => {
        db.query('SELECT codigo, nombre FROM paises')
        .then(paises => {    
            res.json(paises.rows)
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'error obteniendo las regiones' });
        })
    })

    //endpoint para obtener las provincias de la base de datos

    app.get('/api/obtenerRegiones', (req, res) => {
        const pais = req.query.pais;

        //obtenemos el nombre para el listado y la id para el value del desplegable que hay en el front

        db.query(`SELECT id, nombre, codigo_pais FROM regiones WHERE codigo_pais = $1`, [pais])
            .then(regiones => {
                res.json(regiones.rows)
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ error: 'error obteniendo las regiones' });
            })
    })

    //endpoint para sacar la ruta a seguir entre dos puntos de graphhopper

    app.post('/api/rutaGraphhopper', (req, res) => {
        const apikey = process.env.GRAPHHOPPER;

        //sacamos la informaciónn del body de la petición y construimos la url con la que vamos a hacer la consulta a GH
        const entrada = req.body;
        const url = `https://graphhopper.com/api/1/route?point=${entrada.inicio.lat},${entrada.inicio.lng}&point=${entrada.fin.lat},${entrada.fin.lng}&profile=${entrada.perfil}&calc_points=true&points_encoded=false&instructions=false&optimize=false&key=${apikey}`;

        fetch(url)
        .then(r => {
            if (!r.ok) {
                throw new Error(`${r.status}`)
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
        .catch(err => {
            console.log(err);
            res.status(500).json({ error:'Error obteniendo la ruta' });
        })
    })

    //endpoint para cargar avatares

    app.get('/api/auth/urlAvatar', (req, res) => {
        const usuarioId = req.usuario.id;
        const id = req.query.id;

        if (id === undefined || id === "undefined") {
            db.query('SELECT avatar_url FROM usuarios WHERE id = $1', [usuarioId])
            .then(url => {
                res.json(url.rows)
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ error: 'error obteniendo los avatares' });
            })
        } else {
            db.query('SELECT avatar_url FROM usuarios WHERE id = $1', [id])
            .then(url => {
                res.json(url.rows)
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ error: 'error obteniendo los avatares' });
            })
        }
    })
}