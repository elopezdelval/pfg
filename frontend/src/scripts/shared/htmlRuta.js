export default function htmlRuta(r, i) {

//Esta función genera un html reutilizable para renderizar las rutas guardadas, se van creando los elementos y metiendoles el contenido como texto con textContent para evitar posibles xss

  const article = document.createElement("article");
  article.className = "ruta";

  const encabezado = document.createElement("span");
  encabezado.className = "ruta-encabezado";
  encabezado.textContent = `Región: ${r.region}`;

  const distancia = document.createElement("span");
  distancia.textContent = `distancia: ${(r.distancia / 1000).toFixed(1)}km`;

  const verRuta = document.createElement("button");
  verRuta.className = "verRuta";
  verRuta.dataset.indice = i;
  verRuta.textContent = "ruta";

  const reutilizar = document.createElement("button");
  reutilizar.className = "reutilizar";
  reutilizar.dataset.indice = i;
  reutilizar.textContent = "reutilizar";

  const descartar = document.createElement("button");
  descartar.className = "descartar";
  descartar.dataset.indice = i;
  descartar.textContent = "descartar";

  article.append(encabezado, distancia, verRuta, reutilizar, descartar);
  return article;
}
