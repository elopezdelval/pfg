import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import cookieParser from "cookie-parser";

import db from "./config/db.js";
import login from "./auth/login.js";
import authMiddleware from "./auth/authMiddleware.js";
import endpointsUsuarios from "./endpoints/usuarios.js";
import endpointsComunes from "./endpoints/comunes.js";
import endpointsQuedadas from "./endpoints/quedadas.js";
import endpointsMensajeria from "./endpoints/mensajeria.js";
import recuperarPass from "./auth/recuperarPass.js";
import errores from "./errors/errores.js";

const app = express();
const puerto = process.env.PORT || 3000;
const esProduccion = (process.env.NODE_ENV === "production");
app.use(express.json());
app.use(cookieParser());

//Cargamos los endpoints

authMiddleware(app);
login(app, db);
recuperarPass(app, db);
endpointsUsuarios(app, db);
endpointsComunes(app, db);
endpointsQuedadas(app, db);
endpointsMensajeria(app, db);
errores(app);

//En producción servimos también el frontend compilado desde Express.

if (esProduccion) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const rutaDist = path.join(__dirname, "../frontend/dist");

  app.use(express.static(rutaDist));

  app.get("/", (req, res) => {
    res.sendFile(path.join(rutaDist, "index.html"));
  });
}

app.listen(puerto, () => {
  console.log(`Servidor escuchando en http://localhost:${puerto}`);
});
