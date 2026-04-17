export default function htmlQuedada(q, i, apuntarse) {

//Esta función genera un html reutilizable para renderizar las quedadas, se van creando los elementos y metiendoles el contenido como texto con textContent para evitar posibles xss

  const article = document.createElement("article");
  article.className = "quedada";

  const encabezado = document.createElement("span");
  encabezado.className = "tablon-encabezado";
  encabezado.textContent = `${q.actividad} - ${q.region}`;

  const fecha = document.createElement("span");
  fecha.className = "tablon-fecha";
  fecha.textContent = `Fecha: ${new Date(q.fecha).toLocaleDateString()} ${new Date(q.fecha).toLocaleTimeString()}`;

  const organizadorContainer = document.createElement("div");
  organizadorContainer.className = "organizadorContainer";

  const organizador = document.createElement("div");
  organizador.className = "organizador";

  const textoOrganizador = document.createElement("span");
  textoOrganizador.textContent = "Organizador: ";

  const avatar = document.createElement("img");
  avatar.src = q.avatar_url || "/img/avatar.png";
  avatar.alt = "Avatar";
  avatar.className = "avatarQuedada";

  const nombreOrganizador = document.createElement("span");
  nombreOrganizador.textContent = q.organizador;

  const enviarMensaje = document.createElement("button");
  enviarMensaje.textContent = "enviar mensaje";
  enviarMensaje.className = "enviarMensaje";
  enviarMensaje.dataset.indice = i;

  organizador.append(textoOrganizador, avatar, nombreOrganizador);

  organizadorContainer.append(organizador, enviarMensaje);

  const fieldset = document.createElement("fieldset");
  const legend = document.createElement("legend");
  legend.textContent = "Descripción:";
  fieldset.append(legend, document.createTextNode(q.descripcion));

  const detalles = document.createElement("span");
  detalles.textContent = `distancia: ${(q.distancia / 1000).toFixed(1)}km`;
  detalles.appendChild(document.createElement("br"));
  detalles.appendChild(
    document.createTextNode(`ritmo/tiempo estimado: ${q.ritmo}`),
  );

  const botones = document.createElement("div");
  botones.className = "tablon-botones";

  const verRuta = document.createElement("button");
  verRuta.className = "verRuta";
  verRuta.dataset.indice = i;
  verRuta.textContent = "la ruta";

  const unirse = document.createElement("button");
  unirse.className = "unirse";
  unirse.dataset.indice = i;
  unirse.textContent = apuntarse;

  botones.append(verRuta, unirse);

  article.append(encabezado, fecha, organizadorContainer, fieldset, detalles, botones);

  return article;
}
