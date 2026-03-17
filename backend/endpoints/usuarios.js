import bcrypt from "bcrypt";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";

export default function endpointsUsuarios(app, db) {
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

  //endpoint para guardar el avatar en el almacenamiento de supabase y la url en el usuario
  
  //configuramos multer para procesar el archivo que llega desde el front, en este caso el avatar
  
  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });
  
  //Generamos el cliente de supabase para guardar la imagen
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE
  )

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
      .upload(`avatar_${usuario.id}.png`, imagenAvatar.buffer, {contentType: req.file.mimetype, upsert:true})
      .then((r) => {
        if (r.error) {
          throw new Error(r.error);
        }

        //guardamos la url de la imagen en la bbdd
        return db.query(
          "UPDATE usuarios SET avatar_url = $1 WHERE id = $2",
          [`${process.env.SUPABASE_URL}/storage/v1/object/public/Avatares/avatar_${usuario.id}.png`, 
            usuario.id]
        )
        .then(r =>{
          res.status(200).json({ mensaje: 'avatar actualizado'})
        })
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: "error al guardar la imagen" });
      });
  });
}
