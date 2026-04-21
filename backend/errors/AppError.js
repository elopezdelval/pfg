//Definimos la clase AppError para unificar los errores que se causen por la lógica de la propia app

export default class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}

export function createError(status, code, message) {
  return new AppError(status, code, message);
}
