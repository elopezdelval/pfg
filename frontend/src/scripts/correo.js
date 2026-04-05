import iniciarNav from "./shared/nav.js";
import htmlMensaje from "./shared/htmlMensaje.js";

document.addEventListener("DOMContentLoaded", () => {
  iniciarNav();

  const redactarCorreo = document.getElementById("redactarCorreo");
  const formRedactar = document.getElementById("formRedactar");
  const contenedorMensaje = document.getElementById("contenedorMensaje");
  const recibidos = document.getElementById("recibidos");
  const enviados = document.getElementById("enviados");
  const eliminados = document.getElementById("eliminados");
  const enlacesCorreo = document.querySelectorAll(".correoLink");
  const enviarMensaje = document.getElementById("enviarMensaje");
  const destinatarioRedactar = document.getElementById("destinatarioRedactar");
  const asuntoRedactar = document.getElementById("asuntoRedactar");
  const mensajeRedactar = document.getElementById("mensajeRedactar");
  const titulo = document.querySelector(".tituloPagina");
  const cerrarRedactar = document.getElementById('cerrarRedactar');

  //declaramos arrays para dividir los mensajes en los diferentes tablones.

  let mensajes = [];
  let mensajesRecibidos = [];
  let mensajesEnviados = [];
  let mensajesEliminados = [];

  //declaramos la función para pintar los mensajes en los tablones en función de si corresponden a bandeja de entrada, de salida o de eliminados

  function pintarBandejas() {
    recibidos.innerHTML = "";
    enviados.innerHTML = "";
    eliminados.innerHTML = "";

    for (let i = 0; i < mensajesRecibidos.length; i++) {
      recibidos.insertAdjacentHTML(
        "beforeend",
        htmlMensaje(mensajesRecibidos[i], i, "recibidos"),
      );
    }

    for (let i = 0; i < mensajesEnviados.length; i++) {
      enviados.insertAdjacentHTML(
        "beforeend",
        htmlMensaje(mensajesEnviados[i], i, "enviados"),
      );
    }

    for (let i = 0; i < mensajesEliminados.length; i++) {
      eliminados.insertAdjacentHTML(
        "beforeend",
        htmlMensaje(mensajesEliminados[i], i, "eliminados"),
      );
    }
  }

  //declaramos la función para clasificar los mensajes en función de su tipo

  function clasificarMensajes() {
    mensajesRecibidos = mensajes.filter(
      (mensaje) => mensaje.es_destinatario && !mensaje.eliminado_destinatario,
    );
    mensajesEnviados = mensajes.filter(
      (mensaje) => mensaje.es_remitente && !mensaje.eliminado_remitente,
    );
    mensajesEliminados = mensajes.filter(
      (mensaje) => mensaje.eliminado_remitente || mensaje.eliminado_destinatario,
    );
    pintarBandejas();
  }

  //declaramos la función para obtener los mensajes en los que interviene el usuario llamando al back y los clasificamos una vez obtenidos

  function cargarMensajes() {
    fetch("/api/auth/obtenerMensajes")
      .then((r) => {
        if (!r.ok) {
          throw new Error("No se han podido obtener los mensajes");
        }
        return r.json();
      })
      .then((r) => {
        mensajes = r;
        clasificarMensajes();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // Inicialmente solo mostramos los correos recibidos y ocultamos redactar mensaje y contenedorMensaje.

  recibidos.style.display = "block";
  enviados.style.display = "none";
  eliminados.style.display = "none";
  formRedactar.style.display = "none";
  contenedorMensaje.style.display = "none";
  titulo.textContent = "Mensajes recibidos";
  cargarMensajes();

  // Al pulsar redactar mostramos el formulario para redactar un mensaje.

  redactarCorreo.addEventListener("click", () => {
    formRedactar.style.display = "block";
    contenedorMensaje.style.display = "none";
  });

  // Cambiamos los mensajes visibles en función de la opción clickada en el menú lateral.

  enlacesCorreo.forEach((enlace) => {
    enlace.addEventListener("click", () => {
      recibidos.style.display = "none";
      enviados.style.display = "none";
      eliminados.style.display = "none";

      if (enlace.textContent === "Recibidos") {
        recibidos.style.display = "block";
        titulo.textContent = "Mensajes recibidos";
      } else if (enlace.textContent === "Enviados") {
        enviados.style.display = "block";
        titulo.textContent = "Mensajes enviados";
      } else if (enlace.textContent === "Papelera") {
        eliminados.style.display = "block";
        titulo.textContent = "Mensajes eliminados";
      }
    });
  });
  
  //declaramos la función para pintar un mensaje

  function verMensaje(mensaje) {
      contenedorMensaje.innerHTML = `
      <p class="mensaje-encabezado">${new Date(mensaje.fecha_envio).toLocaleString()} - ${mensaje.asunto || "(sin asunto)"}</p>
      <p class="mensaje-quien">de ${mensaje.remitente} para ${mensaje.destinatario}</p>
      <p>de ${mensaje.cuerpo}</p>
      <button type="button" id="cerrarMensaje">cerrar</button>
      `;
      
      contenedorMensaje.style.display = "block";
      
      document.getElementById("cerrarMensaje").addEventListener("click", () => {
          contenedorMensaje.style.display = "none";
        });
    }
    
    //declaramos una función para obtener el mensaje que toque del array que toque en función de la bandeja y del índice que tenga el dataset

    function obtenerMensaje(bandeja, indice) {
      if (bandeja === "recibidos") return mensajesRecibidos[indice];
      if (bandeja === "enviados") return mensajesEnviados[indice];
      return mensajesEliminados[indice];
    }

    //Aquí añadimos los listeners a las bandejas, dado que todas hacen lo mismo no hace falta separar la lógica

    [recibidos, enviados, eliminados].forEach((contenedor) => {
    contenedor.addEventListener("click", (event) => {

      //Si el botón es el de ver mensaje, ejecutamos verMensaje del mensaje que toque

      if (event.target.classList.contains("verMensaje")) {
        const bandeja = event.target.dataset.bandeja;
        const indice = Number(event.target.dataset.indice);
        const mensaje = obtenerMensaje(bandeja, indice);

        if (!mensaje) return;

        verMensaje(mensaje);

        //Cuando se abre un mensaje se marca como leido en la bbdd

        fetch("/api/auth/marcarLeido", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: mensaje.id }),
        }).catch((err) => {
          console.log(err);
        });
      }

      //Si el botón es el de eliminar mensaje, lo modificamos en la bbdd y recargamos los tablones

      if (event.target.classList.contains("eliminarMensaje")) {
        fetch("/api/auth/eliminarMensaje", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: Number(event.target.dataset.id) }),
        })
          .then((r) => {
            if (!r.ok) {
              throw new Error("Error eliminando el mensaje");
            }
            return r.json();
          })
          .then(() => {
            cargarMensajes();
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  });

  //Añadimos el listener para enviar un mensaje y si todo va bien, recargamos los tablones para que aparezca en enviados

  enviarMensaje.addEventListener("click", () => {
    fetch("/api/auth/enviarMensaje", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destinatario: destinatarioRedactar.value,
        asunto: asuntoRedactar.value,
        mensaje: mensajeRedactar.value,
      }),
    })
      .then((r) => {
        if (!r.ok) {
          throw new Error("Error enviando el mensaje");
        }
        return r.json();
      })
      .then(() => {
        formRedactar.reset();
        formRedactar.style.display = "none";
        cargarMensajes();
      })
      .catch((err) => {
        console.log(err);
      });
  });

  //Añadimos un evento para quitar el formulario pulsando escape

  document.addEventListener('keydown', (event) => {
    if (formRedactar.style.display != "none" && event.key === 'Escape') {
      formRedactar.style.display = "none";
    }
  })

  cerrarRedactar.addEventListener('click', () => {
    formRedactar.style.display = "none";
  })
});
