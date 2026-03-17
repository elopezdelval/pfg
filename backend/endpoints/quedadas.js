export default function endpointsQuedadas(app, db) {

    //endpoint para guardar las quedadas

    app.post('/api/auth/guardarQuedada', (req, res) => {
        const ruta = req.body.ruta;
        const quedada = req.body.quedada;
        const usuario = req.usuario.nombre;

        //Llamamos a la función guardar_quedada, que está definida en la bbdd para guardar la ruta y la quedada

        db.query(
            'SELECT guardar_quedada($1, $2, $3, $4, $5, $6, $7, $8) AS id',
            [ruta, quedada.region, ruta.distancia, quedada.actividad, quedada.ritmo, quedada.descripcion, quedada.fecha, usuario]
        )
            .then(r => {
                const idQuedada = r.rows[0].id;
                console.log('Quedada guardada con id:', idQuedada);

                res.status(201).json({ mensaje: 'Quedada guardada con éxito'});
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ error: 'Error guardando la quedada' });
            });
    });

    //endpoint para obtener las quedadas para el tablón

    app.get('/api/auth/obtenerQuedadas', (req, res) => {
        const usuario = req.usuario.id;

        //Llamamos a la función obtener_quedadas, definida en la bbdd para obtener los datos necesarios para el tablón de quedadas

        db.query('SELECT * FROM obtener_quedadas($1)', [usuario])
            .then(r => {
                res.json(r.rows);
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ error: 'Error obteniendo las quedadas' });
            });
    });

    //endpoint para apuntarse o desapuntarse de una quedada

    app.post('/api/auth/unirseQuedada', (req, res) => {
        const usuario = req.usuario.id;
        const idQuedada = req.body.id;
        const apuntado = req.body.apuntado;

        if (apuntado) {
            db.query('DELETE FROM usuarios_quedadas WHERE usuario_id = $1 AND quedada_id = $2', [usuario, idQuedada])
                .then(r => {
                    res.json({ mensaje: 'Desapuntado de la quedada' });
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).json({ error: 'Error desapuntándose de la quedada' });
                });
        } else {
            db.query('INSERT INTO usuarios_quedadas (usuario_id, quedada_id) VALUES ($1, $2)', [usuario, idQuedada])
                .then(r => {
                    res.json({ mensaje: 'Apuntado a la quedada' });
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).json({ error: 'Error apuntándose a la quedada' });
                })
        }
    });

    //endpoint para obtener las rutas, usamos una función definida en la bbdd

    app.get('/api/auth/obtenerRutas', (req, res) => {
        const usuario = req.usuario.id;

        db.query('SELECT * FROM obtener_rutas($1)', [usuario])
            .then(r => {
                res.json(r.rows);
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ error: 'Error obteniendo las rutas' });
            });
    });

    //endpoint para guardar / eliminar rutas

    app.post('/api/auth/eliminarRuta', (req, res) => {
        const usuario = req.usuario.id;
        const idRuta = req.body.id;

        db.query('DELETE FROM usuarios_rutas WHERE usuario_id = $1 AND ruta_id = $2', [usuario, idRuta])
            .then(r => {
                res.json({ mensaje: 'Ruta eliminada' });
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ error: 'Error eliminando la ruta' });
            });
    });

    //endpoint para guardar rutas, en este caso devolvemos la ruta para poder añadirla al tablón cuando se llama desde miActividad

    app.post('/api/auth/guardarRuta', (req, res) => {
        const usuario = req.usuario.id;
        const idRuta = req.body.id;

        db.query('INSERT INTO usuarios_rutas (usuario_id, ruta_id) VALUES ($1, $2)', [usuario, idRuta])
            .then(r => {
                db.query('SELECT * FROM obtener_rutas($1) WHERE id = $2', [usuario, idRuta])
                .then(r => {
                    res.json(r.rows[0]);
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).json({ error: 'Error obteniendo la ruta guardada' });
                });
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ error: 'Error guardando la ruta' });
            });
    });
}