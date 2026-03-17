function n(a,t,e){return`<article class="quedada">                
    <span class="tablon-encabezado">${a.actividad} - ${a.region}</span>
    <span class="tablon-fecha">Fecha: ${new Date(a.fecha).toLocaleDateString()} ${new Date(a.fecha).toLocaleTimeString()}</span>
    <div class="organizador">
      <span>Organizador: </span>
      <img src="${a.avatar_url}" alt="Avatar" class="avatarQuedada">
      <span> ${a.organizador}</span>     
    </div>
    <fieldset> 
      <legend>Descripción:</legend>${a.descripcion}     
    </fieldset>
    <span>distancia: ${(a.distancia/1e3).toFixed(1)}km<br>ritmo/tiempo estimado: ${a.ritmo}</span>
    <div class="tablon-botones">
      <button class="verRuta" data-indice="${t}">la ruta</button>
      <button class="unirse" data-indice="${t}">${e}</button>                
    </div>            
  </article>`}export{n as h};
