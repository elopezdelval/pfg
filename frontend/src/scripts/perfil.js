import urlAvatar from './shared/cargarAvatar.js';
import iniciarNav from './shared/nav.js';
import { selectorRegion, obtenerRegiones } from "./shared/region.js";

document.addEventListener('DOMContentLoaded', () => {
    
    iniciarNav();
    selectorRegion();

    const form = document.getElementById('formPerfil');

    const avatar = document.getElementById("fotoPerfil"); 
    const vistaPrevia = document.getElementById("vistaPrevia");

    //Cargamos el avatar del usuario en caso de tenerlo

    urlAvatar()
    .then(r => {
        if (r[0].avatar_url) {
            vistaPrevia.src = r[0].avatar_url;
        }
    })

    avatar.addEventListener("change", () => { 
        const file = avatar.files[0]; 
        if (!file) 
            return; 
        const url = URL.createObjectURL(file); 
        vistaPrevia.src = url; 
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        if (avatar.files.length != 0) {
            const imagen = new FormData();
            imagen.append('avatar', avatar.files[0]);

            fetch('/api/auth/cambiarAvatar', {
                method: 'PUT',
                body: imagen
            })
        }

        
    })
});