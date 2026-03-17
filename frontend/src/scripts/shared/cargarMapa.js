//Esto borra el mapa y carga el mapa de leaflet en función del tipo de deporte que se pase como parámetro

export default function cargarMapa(mapa, deporte) {
    if (deporte == 'ciclismo') {
        mapa.eachLayer(layer => {
            mapa.removeLayer(layer);
        });
        L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(mapa);
    } else if (deporte == 'senderismo') {
        mapa.eachLayer(layer => {
            mapa.removeLayer(layer);
        });
        L.tileLayer('https://tile.openmaps.fr/openhikingmap/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(mapa);

    } else {
        mapa.eachLayer(layer => {
            mapa.removeLayer(layer);
        });
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(mapa);
    }
}