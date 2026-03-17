export default function htmlRuta(r, i) {
  return `<article class="ruta">                
    <span class="ruta-encabezado">Región: ${r.region}</span>    
    <span>distancia: ${(r.distancia / 1000).toFixed(1)}km</span>
    <button class="verRuta" data-indice="${i}">ruta</button>
    <button class="reutilizar" data-indice="${i}">reutilizar</button> 
    <button class="descartar" data-indice="${i}">descartar</button>                           
  </article>`;
}