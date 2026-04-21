import { DatabaseError } from "pg";
import AppError, { createError } from "./AppError.js";

//Creamos una función para enviar el error al front

function sendError(res, error) {
  return res.status(error.status).json({
    error: error.code,
    message: error.message,
  });
}

export default function errores(app) {

  //Definimos el endpoint de manejo de errores
  
  app.use((err, req, res, next) => {

    //Si el error lo ha creado la propia app, lo enviamos tal cual

    if (err instanceof AppError) {
      return sendError(res, err);
    }

    //Si el error es de la base de datos, lo pasamos por consola y enviamos error genérico de BD al front

    if (err instanceof DatabaseError) {
      console.error(err);
      return sendError(
        res,
        createError(500, "DATABASE_ERROR", "Error en la base de datos"),
      );
    }

    //Si el error es de alguna librería, o algún error inesperado, lo pasamos por consola y enviamos al front error genérico de server
    
    console.error(err);
    return sendError(
      res,
      createError(
        500,
        "INTERNAL_SERVER_ERROR",
        "Se ha producido un error interno del servidor",
      ),
    );
  });
}
