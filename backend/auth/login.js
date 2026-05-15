import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createError } from "../errors/AppError.js";

export default function login(app, db) {
  app.post("/api/login", (req, res, next) => {
    const credenciales = req.body;

    console.log(`Intento de login para usuario: ${credenciales.usuario}`);

    //Consultamos a la base de datos por usuario

    db.query("SELECT id, pass FROM usuarios WHERE usuario = $1", [
      credenciales.usuario,
    ])
      .then((respuesta) => {

        //Confirmamos lo primero que el usuario exista

        if (respuesta.rows.length === 0) {
          console.log(`Login fallido: usuario no encontrado - ${credenciales.usuario}`);
          return next(createError(401, "INVALID_CREDENTIALS", "Credenciales incorrectas"));
        }

        //Verificamos si la contraseña coincide y si es así, generamos el token y lo enviamos en una cookie con la respuesta

        return bcrypt.compare(credenciales.pass, respuesta.rows[0].pass)
          .then((coincide) => {
            if (!coincide) {
              console.log(`Login fallido: contraseña incorrecta - ${credenciales.usuario}`);
              return next(createError(401, "INVALID_CREDENTIALS", "Credenciales incorrectas"));
            }

            const token = jwt.sign(
              { id: respuesta.rows[0].id, nombre: credenciales.usuario },
              process.env.SECRETO_JWT,
              { expiresIn: "1d" },
            );

            res.cookie("token", token, {
              httpOnly: true,
              sameSite: "strict",
              secure: true
            });

            console.log(`Login exitoso: ${credenciales.usuario}`);
            return res.json({ ok: true });
          });
      })
      .catch(next);
  });
}
