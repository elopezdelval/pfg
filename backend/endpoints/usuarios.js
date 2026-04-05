import bcrypt from "bcrypt";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";

export default function endpointsUsuarios(app, db) {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w]).{10,}$/;

  //endpoint para confirmar si el nombre de usuario está disponible

  app.get("/api/buscarNombre", (req, res) => {
    const usuario = req.query.usuario;

    db.query("SELECT id FROM usuarios WHERE usuario = $1", [usuario])
      .then((usuario) => {
        if (usuario.rows.length === 0) {
          res.status(200).json({ mensaje: "usuario disponible" });
        } else {
          res.status(400).json({ mensaje: "usuario no disponible" });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: "error obteniendo los usuarios" });
      });
  });

  //endpoint para obtener los datos del usuario activo para el perfil

  app.get("/api/auth/datosUsuario", (req, res) => {
    db.query("SELECT * FROM  obtener_datos_usuario($1)", [req.usuario.id])
      .then((r) => {
        res.json(r.rows[0]);
      })
      .catch((err) => {
        console.error(err);
        res
          .status(500)
          .json({ error: "Error obteniendo los datos de usuario" });
      });
  });

  //endpoint de registro de usuarios

  app.post("/api/registrarUsuario", (req, res) => {
    const usuario = req.body;

    //verificamos que no haya campos no nulos en la bbdd vacíos

    if (
      !usuario.usuario ||
      !usuario.email ||
      !usuario.pass ||
      !usuario.nombre
    ) {
      return res.status(400).json({ error: "faltan campos obligatorios" });
    }

    if (!emailRegex.test(usuario.email.trim())) {
      return res.status(400).json({ error: "formato de email incorrecto" });
    }

    if (!passRegex.test(usuario.pass)) {
      return res.status(400).json({
        error:
          "La contraseña debe tener al menos 10 caracteres una mayúscula una minúscula un número y un caracter especial",
      });
    }

    //encriptamos la contraseña e insertamos todo en la bbdd

    const hashedPass = bcrypt.hashSync(usuario.pass, 8);

    db.query(
      "INSERT INTO usuarios(usuario, email, pass, nombre, fecha_nacimiento, region_id) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        usuario.usuario.trim(),
        usuario.email.trim(),
        hashedPass,
        usuario.nombre.trim(),
        usuario.nacimiento,
        usuario.region,
      ],
    )
      .then((correcto) =>
        res.status(200).json({ mensaje: "usuario registrado" }),
      )
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: "error al insertar el usuario" });
      });
  });

  //endpoint para modificar los datos de usuario

  app.put("/api/auth/modificarPerfil", (req, res) => {
    const datos = req.body;

    if (!datos.usuario || !datos.email || !datos.nombre) {
      return res.status(400).json({ error: "faltan campos obligatorios" });
    }

    if (!emailRegex.test(datos.email.trim())) {
      return res.status(400).json({ error: "formato de email incorrecto" });
    }

    //Verificamos si el usuario está intentando cambiar la contraseña, y si es así, verificamos la contraseña anterior, si pasa encriptamos la nueva y enviamos los datos a la bbdd

    if (datos.newPass != "") {
      if (!passRegex.test(datos.newPass)) {
        return res.status(400).json({
          error:
            "La contraseña debe tener al menos 10 caracteres una mayúscula una minúscula un número y un caracter especial",
        });
      }

      db.query("SELECT pass FROM usuarios WHERE id = $1", [req.usuario.id,])
      .then((r) => {
        return bcrypt.compare(datos.pass, r.rows[0].pass)
          .then((coincide) => {
            if (!coincide) {
              return res.status(401).json({ error: "Credenciales incorrectas" });
            }
            //Si pasa la verificación, hasheamos la cntraseña y hacemos la query
            const hashedPass = bcrypt.hashSync(datos.newPass, 8);
            db.query(
              "UPDATE usuarios SET usuario = $1, nombre = $2, email = $3, pass = $4, fecha_nacimiento = $5, region_id = $6 WHERE id = $7",
              [
                datos.usuario.trim(),
                datos.nombre.trim(),
                datos.email.trim(),
                hashedPass,
                datos.nacimiento,
                datos.region,
                req.usuario.id,
              ],
            )
              .then(() => {
                res.status(200).json({ mensaje: "perfil actualizado" });
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({ error: "error actualizando el perfil" });
              });
          });
      });
    } else {

      //Si no se está cambiando la contraseña enviamos el resto de los datos a la bbdd
      db.query(
        "UPDATE usuarios SET usuario = $1, nombre = $2, email = $3, fecha_nacimiento = $4, region_id = $5 WHERE id = $6",
        [
          datos.usuario.trim(),
          datos.nombre.trim(),
          datos.email.trim(),
          datos.nacimiento,
          datos.region,
          req.usuario.id,
        ],
      )
        .then(() => {
          res.status(200).json({ mensaje: "perfil actualizado" });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ error: "error actualizando el perfil" });
        });
    }
  });

  //endpoint para guardar el avatar en el almacenamiento de supabase y la url en el usuario

  //configuramos multer para procesar el archivo que llega desde el front, en este caso el avatar

  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });

  //Generamos el cliente de supabase para guardar la imagen

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE,
  );

  app.put("/api/auth/cambiarAvatar", upload.single("avatar"), (req, res) => {
    const imagenAvatar = req.file;
    const usuario = req.usuario;

    //verificamos que lo que llega es una imagen

    if (!imagenAvatar || !imagenAvatar.mimetype.startsWith("image/")) {
      return res.status(400).json({ error: "imagen no válida" });
    }

    //guardamos la imagen en el storage

    supabase.storage
      .from("Avatares")
      .upload(`avatar_${usuario.id}.png`, imagenAvatar.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      })
      .then((r) => {
        if (r.error) {
          throw new Error(r.error);
        }

        //guardamos la url de la imagen en la bbdd
        return db
          .query("UPDATE usuarios SET avatar_url = $1 WHERE id = $2", [
            `${process.env.SUPABASE_URL}/storage/v1/object/public/Avatares/avatar_${usuario.id}.png`,
            usuario.id,
          ])
          .then((r) => {
            res.status(200).json({ mensaje: "avatar actualizado" });
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: "error al guardar la imagen" });
      });
  });
}
