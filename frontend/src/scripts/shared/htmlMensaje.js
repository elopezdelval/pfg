export default function htmlMensaje(mensaje, i, bandeja) {

//Esta función genera un html reutilizable para renderizar los mensajes, se van creando los elementos y metiendoles el contenido como texto con textContent para evitar posibles xss
  
  const asunto = mensaje.asunto || "(sin asunto)";

  const article = document.createElement("article");
  article.className = "mensaje";

  if (bandeja === "recibidos" && !mensaje.leido) {
    article.classList.add("noLeido");
  }

  const encabezado = document.createElement("p");
  encabezado.className = "mensaje-encabezado";
  encabezado.textContent = `${new Date(mensaje.fecha_envio).toLocaleString()} - ${asunto}`;

  const meta = document.createElement("p");
  meta.className = "mensaje-quien";
  meta.textContent = `de ${mensaje.remitente} para ${mensaje.destinatario}`;

  const botones = document.createElement("div");
  botones.className = "mensaje-botones";

  const ver = document.createElement("button");
  ver.className = "verMensaje";
  ver.dataset.bandeja = bandeja;
  ver.dataset.indice = i;
  ver.textContent = "ver";

  botones.appendChild(ver);

  if (bandeja !== "eliminados") {
    const eliminar = document.createElement("button");
    eliminar.className = "eliminarMensaje";
    eliminar.dataset.bandeja = bandeja;
    eliminar.dataset.id = mensaje.id;
    eliminar.dataset.indice = i;
    eliminar.textContent = "eliminar";
    botones.appendChild(eliminar);
  }

  article.append(encabezado, meta, botones);
  return article;
}
