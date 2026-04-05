import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default function login(app, db) {
  app.post('/api/login', (req, res) => {
    const credenciales = req.body;

    //Consultamos a la base de datos por usuario

    db.query('SELECT id, pass FROM usuarios WHERE usuario = $1', [credenciales.usuario,])
      .then((respuesta) => {

        //Confirmamos lo primero que el usuario exista

        if (respuesta.rows.length === 0) {
          return res.status(401).json({ error: 'El usuario no existe' });
        }

        //Verificamos si la contraseña coincide y si es así, generamos el token y lo enviamos en una cookie con la respuesta

        return bcrypt.compare(credenciales.pass, respuesta.rows[0].pass)
          .then((coincide) => {
            if (!coincide) {
              return res.status(401).json({ error: 'Credenciales incorrectas' });
            }

            const token = jwt.sign(
              { id: respuesta.rows[0].id, nombre: credenciales.usuario },
              process.env.SECRETO_JWT,
              { expiresIn: '7d' },
            );

            res.cookie('token', token, {
              httpOnly: true,
              sameSite: 'lax',
            });

            return res.json({ ok: true });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({ error: 'Error del servidor' });
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: 'Error del servidor' });
      });
  });
}
