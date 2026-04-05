export default function htmlMensaje(mensaje, i, bandeja) {
  let claseNoLeido = "";
  if (bandeja === "recibidos" && !mensaje.leido) {
    claseNoLeido = " noLeido"
  }
  let botonEliminar = "";
  if (bandeja != "eliminados") {
    botonEliminar = `<button class="eliminarMensaje" data-bandeja="${bandeja}" data-id="${mensaje.id}">eliminar</button>`;
  }

  return `<article class="mensaje${claseNoLeido}">
    <p class="mensaje-encabezado">${new Date(mensaje.fecha_envio).toLocaleString()} - ${mensaje.asunto}</p>
    <p class="mensaje-quien">de ${mensaje.remitente} para ${mensaje.destinatario}</p>
    <div class="mensaje-botones">
      <button class="verMensaje" data-bandeja="${bandeja}" data-indice="${i}">ver</button>
      ${botonEliminar}
    </div>
  </article>`;
}