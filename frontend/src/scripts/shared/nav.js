//Menú desplegable para mostrar/ocultar el menú de navegación en modo movil/tablet

export default function iniciarNav() {
  const desplegable = document.getElementById("desplegable");
  const menu = document.getElementById("menu");
  const correo = document.getElementById("correo");
  menu.hidden = true;

  desplegable.addEventListener("click", (event) => {
    event.preventDefault();
    menu.hidden = !menu.hidden;
  });

  //Cada vez que cambiamos de pantalla, al cargar el nav, si hay mensajes nuevos, cargamos la animación de que hay mensajes nuevos
  fetch("/api/auth/obtenerMensajes")
    .then((r) => {
      if (!r.ok) {
        throw new Error("No se han podido obtener los mensajes");
      }
      return r.json();
    })
    .then((mensajes) => {
      let mensajesNuevos = false;
      mensajes.forEach((mensaje) => {
        if (mensaje.es_destinatario == true && mensaje.leido === false) {
          mensajesNuevos = true;
        }
      });
      if (mensajesNuevos === true) {
        correo.style.animation = "tienesCorreo 2s 1s";
      }
    });
}
