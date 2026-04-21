import enviarEmail from "../utils/email.js";
import { createError } from "../errors/AppError.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { ok } from "assert";

export default function recuperarPass(app, db) {
  //Este endpoint genera un enlace para recuperar contraseñas. Para hacerlo seguro, generamos un token temporal con vencimiento en 15min y de un solo uso.

  app.post("/api/recuperarPass", (req, res, next) => {
    const usuario = req.body.usuario;

    //Lo primero obtenemos la id y el correo del usuario cuya contraseña se quiera cambiar

    db.query("SELECT id, email FROM usuarios WHERE usuario = $1", [usuario])
      .then((r) => {
        if (r.rows.length === 0) {
          return next(createError(404, "NOT_FOUND", "Usuario no encontrado"));
        }

        //Si el usuario existe, generamos un token para meterlo en la url de recuperación de contraseña y lo hasheamos para guardarlo en la base de datos

        const datos = r.rows[0];
        const token = crypto.randomBytes(32).toString("hex");
        const hashedToken = bcrypt.hashSync(token, 8);

        //Ahora creamos un registro en la bbdd con el id del usuario y el token hasheado para validarlo cuando intente cambiar la contraseña

        return db
          .query(
            "INSERT INTO recuperar_pass (usuario_id, token) VALUES ($1, $2) RETURNING id",
            [datos.id, hashedToken],
          )
          .then((result) => {
            //Aquí generamos el cuerpo del correo de recuperación con el id del registro y el token

            const cuerpo = `<p>Estimado usuario<br>Le remitimos un enlace para que proceda a la recuperación de la contraseña de su cuenta en nuestra página La Grupeta. Haga click en el enlace para establecer una nueva contraseña.<br>http://localhost:5173/registro.html?id=${result.rows[0].id}&token=${token}<br>Por favor realice el cambio de contraseña cuanto antes, la validez del enlace facilitado expira en 15min</p>`;

            return enviarEmail(datos.email,"Recuperación de contraseña",cuerpo);
          });
      })
      .then((info) => {
        //Si enviarEmail devuelve accepted significa que el envío ha ido bien, por lo que devolvemos 200 al front con el mensaje

        if (info.accepted.length === 0) {
          return next(createError(500,"INTERNAL_SERVER_ERROR","No se ha podido enviar el email"));
        }
        res.status(200).json({message: "Se ha enviado un enlace para\nestablecer una nueva contraseña\na la dirección de correo vinculada\nal usuario introducido. Por favor,\nrevise su bandeja de entrada"});
      })
      .catch(next);
  });

  app.post("/api/cambiarPass", (req, res, next) => {
    const datos = req.body;

    //Lo primero obtenemos los datos de la recuperación de la bbdd generando un booleano que será false si han pasado 15min desde la creación del token

    db.query("SELECT usuario_id, token, (valido_hasta > NOW()) AS es_valido FROM recuperar_pass WHERE id = $1",[datos.id],)
    .then((r) => {

      const respuesta = r.rows[0];

      //Ahora comprobamos que el token que llega con el token hasheado de la bbdd y que no está caducado

      return bcrypt.compare(datos.token, respuesta.token).then((coincide) => {
        if (!coincide) {
          return next(createError(401, "INVALID_CREDENTIALS", "Token inválido"));
        } else if (!respuesta.es_valido) {
          return next(createError(401, "INVALID_CREDENTIALS", "El token ha expirado"));
        } else {
        
          //Una vez verificado que el token es válido, validmos las contraseñas enviadas y si están bien, la hasheamos y la actualizamos en la bbdd

          const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w]).{10,}$/;

          if (!passRegex.test(datos.nuevoPass)) {
            return next(createError(400,"VALIDATION_ERROR","La contraseña debe tener al menos 10 caracteres, una mayúscula, una minúscula, un dígito y un caracter especial"));
          } else if (datos.nuevoPass != datos.confirmarPass) {
            return next(createError(400,"VALIDATION_ERROR","Las contraseñas no coinciden"));
          } else {

            //Si todo está ok, actualizamos la bbdd y enviamos al front respuesta ok

            const hashedPass = bcrypt.hashSync(datos.nuevoPass, 8);
            db.query("UPDATE usuarios SET pass = $1 WHERE id = $2", [hashedPass, respuesta.usuario_id])
            .then(final => {
                return res.status(200).json({ ok: true, message: "contraseña cambiada con éxito" });
            })
            .catch(next);
          }
        }
      })
    })
    .catch(next)
  });
}
