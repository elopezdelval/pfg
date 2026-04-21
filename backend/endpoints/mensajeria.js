import { createError } from "../errors/AppError.js";

export default function endpointsMensajeria(app, db) {
  
  //endpoint para obtener los mensajes de la bbdd, se utiliza una función definida en la bbdd

  app.get("/api/auth/obtenerMensajes", (req, res, next) => {
    const usuarioId = req.usuario.id;

    db.query("SELECT * FROM obtener_mensajes($1)", [usuarioId])
      .then((r) => {
        res.json(r.rows);
      })
      .catch(next);
  });

  //endpoint para guardar un mensaje. Primero obtenemos el id del destinatario para poder guardarlo y que le aparezca en su bandeja.

  app.post("/api/auth/enviarMensaje", (req, res, next) => {
    const remitenteId = req.usuario.id;
    const { destinatario, asunto, mensaje } = req.body;

    if (!destinatario || !mensaje) {
      return next(createError(400, "MISSING_REQUIRED_FIELDS", "Faltan destinatario y/o mensaje"));
    }

    db.query("SELECT id FROM usuarios WHERE usuario = $1", [destinatario.trim()])
      .then((r) => {
        if (r.rows.length === 0) {
          return next(createError(404, "NOT_FOUND", "Destinatario no encontrado"));
        }

        return db.query("INSERT INTO mensajes(remitente_id, destinatario_id, asunto, cuerpo) VALUES ($1, $2, $3, $4) RETURNING id",
            [remitenteId, r.rows[0].id, asunto?.trim() || "", mensaje.trim()],
          )
          .then(() => {
            res.status(201).json({ message: "mensaje enviado" });
          });
      })
      .catch(next);
  });

  //endpoint para marcar un mensaje como leido cuando se abre por parte del destinatario.

  app.put("/api/auth/marcarLeido", (req, res, next) => {
    const usuarioId = req.usuario.id;
    const { id } = req.body;

    db.query(
      "UPDATE mensajes SET leido = true WHERE id = $1 AND destinatario_id = $2",
      [id, usuarioId],
    )
      .then(() => {
        res.status(200).json({ message: "mensaje marcado como leido" });
      })
      .catch(next);
  });

  //endpoint para eliminar mensaje, usamos una función definida en la bbdd para marcar como eliminado en el mensaje al destinatario o remitente dependiendo de quien lo esté borrando

  app.post("/api/auth/eliminarMensaje", (req, res, next) => {
    const usuarioId = req.usuario.id;
    const { id } = req.body;

    db.query("SELECT eliminar_mensajes($1, $2)", [id, usuarioId])
      .then(() => {
        res.status(200).json({ message: "mensaje eliminado" });
      })
      .catch(next);
  });
}
