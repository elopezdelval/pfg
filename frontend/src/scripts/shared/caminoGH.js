//Hace una petición al back para que nos devuelva los puntos del camino optimizado para el perfil que toque, devuelve una promesa con un json con distancia y coordenadas

export default function caminoGH(inicio, fin, perfil) {
    return fetch('/api/rutaGraphhopper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            inicio: { lat: inicio.lat, lng: inicio.lng },
            fin: { lat: fin.lat, lng: fin.lng },
            perfil: perfil
        })
    })
        .then(resGH => {
            if (!resGH.ok){
                throw new Error(`${resGH.status} error obteniendo la ruta`);
            }
            return resGH.json()
        })
        .catch(err => console.log(err));
}