import jwt from "jsonwebtoken";
import { createError } from "../errors/AppError.js";

export default function authMiddleware(app) {
  //middleware para las rutas que requieren de autenticación

  app.use("/api/auth", (req, res, next) => {
    //comprobamos que la petición venga con token y que el token sea válido, si es así pasamos al endpoint que toque, de no ser así, pasamos 401 al front

    const token = req.cookies.token;

    //Si no hay token en la petición, retornamos error

    if (!token) {
      return next(createError(401, "UNAUTHORIZED", "No se envió token de autenticacion"));
    }

    //Si hay token, verificamos que sea válido y de ser así pasamos al endpoint que toque y de no ser así, devolvemos error
    try {
      req.usuario = jwt.verify(token, process.env.SECRETO_JWT);
      next();
    } catch {
      return next(createError(401, "INVALID_TOKEN", "Token no valido o caducado"));
    }
  });

  //Endpoint para obtener el usuario actual

  app.get("/api/auth/usuarioActual", (req, res) => {
    res.status(200).json({
      nombre: req.usuario.nombre,
      id: req.usuario.id
    });
  });
}
