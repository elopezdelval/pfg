//Menú desplegable para mostrar/ocultar el menú de navegación en modo movil/tablet

export default function iniciarNav() {
    const desplegable = document.getElementById('desplegable');
    const menu = document.getElementById('menu');
    menu.hidden = true;
        
    desplegable.addEventListener('click', (event) => {
        event.preventDefault();
        menu.hidden = !menu.hidden;
    });
}