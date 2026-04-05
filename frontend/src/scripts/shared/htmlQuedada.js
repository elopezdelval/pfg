export default function htmlQuedada(q, i, apuntarse) {
  return `<article class="quedada">                
    <span class="tablon-encabezado">${q.actividad} - ${q.region}</span>
    <span class="tablon-fecha">Fecha: ${new Date(q.fecha).toLocaleDateString()} ${new Date(q.fecha).toLocaleTimeString()}</span>
    <div class="organizador">
      <span>Organizador: </span>
      <img src="${q.avatar_url}" alt="Avatar" class="avatarQuedada">
      <span> ${q.organizador}</span>     
    </div>
    <fieldset> 
      <legend>Descripción:</legend>${q.descripcion}     
    </fieldset>
    <span>distancia: ${(q.distancia / 1000).toFixed(1)}km<br>ritmo/tiempo estimado: ${q.ritmo}</span>
    <div class="tablon-botones">
      <button class="verRuta" data-indice="${i}">la ruta</button>
      <button class="unirse" data-indice="${i}">${apuntarse}</button>                
    </div>            
  </article>`;
}