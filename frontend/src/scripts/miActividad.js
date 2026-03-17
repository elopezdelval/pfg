import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iniciarNav from "./shared/nav.js";
import cargarMapa from "./shared/cargarMapa.js";
import htmlQuedada from "./shared/htmlQuedada.js";
import htmlRuta from "./shared/htmlRuta.js";

document.addEventListener("DOMContentLoaded", () => {
  iniciarNav();

  //capturamos el boton y asignamos el evento para mostrar mis rutas / mis quedadas

  const botonRutas = document.getElementById("quedadas_rutas");
  const misQuedadas = document.getElementById("misQuedadas");
  const misRutas = document.getElementById("misRutas");
  const titulo = document.querySelector(".tituloPagina");

  //Inicialmente aparecen mis quedadas y el botón muestra 'ver rutas guardadas'. Si se pulsa el botón, se ocultan las quedadas y se muestran las rutas

  misRutas.style.display = "none";

  botonRutas.addEventListener("click", () => {
    if (misRutas.style.display === "none") {
      misQuedadas.style.display = "none";
      misRutas.style.display = "block";
      titulo.textContent = "Mis rutas";
      botonRutas.textContent = "ver mis quedadas";
      guardarRuta.style.display = "none";
    } else {
      misQuedadas.style.display = "block";
      misRutas.style.display = "none";
      titulo.textContent = "Mis quedadas";
      botonRutas.textContent = "ver rutas guardadas";
      guardarRuta.style.display = "block";
    }
  });

  //Llamamos al back para cargar las quedadas y pintamos aquellas en las que el usuario esté apuntado

  let quedadas = [];

  fetch("/api/auth/obtenerQuedadas")
    .then((r) => {
      if (!r.ok) {
        throw new Error("No se han podido obtener las quedadas");
      }
      return r.json();
    })
    .then((r) => {
      quedadas = r;

      const apuntarse = "desapuntarse";

      for (let i = 0; i < quedadas.length; i++) {
        if (quedadas[i].apuntado) {
          
          //si el usuario no tiene avatar cargamos el avatar por defecto
          if (quedadas[i].avatar_url === null) {
            quedadas[i].avatar_url = "/img/avatar.png";
          }

          misQuedadas.insertAdjacentHTML(
            "beforeend",
            htmlQuedada(quedadas[i], i, apuntarse),
          );
        }
      }
    })
    .catch((err) => {
      misQuedadas.innerText = err.message;
      console.log(err);
    });

  //Cargamos el mapa y capturamos los botones del mapa

  const mapa = L.map("mapaTablon").setView([40.4168, -3.7038], 6);
  const contenedorMapa = document.getElementById("contenedorMapa");
  const cerrarMapa = document.getElementById("cerrarMapa");
  const guardarRuta = document.getElementById("guardarRuta");
  contenedorMapa.style.display = "none";

  misQuedadas.addEventListener("click", (event) => {
    //si se pulsa ver ruta se muestra el mapa con la ruta de la quedada

    if (event.target.classList.contains("verRuta")) {
      contenedorMapa.style.display = "block";

      const indice = parseInt(event.target.dataset.indice);

      mapa.setView(quedadas[indice].ruta.coordenadas[0], 15);
      cargarMapa(mapa, quedadas[indice].actividad);
      L.polyline(quedadas[indice].ruta.coordenadas, {
        color: "#bbff00",
        weight: 6,
      }).addTo(mapa);
    }

    //Si se pulsa guardar ruta, se envía la petición al back, se guarda la ruta en el array de rutas y se añade al tablon de rutas

    guardarRuta.addEventListener("click", () => {
      const indice = parseInt(event.target.dataset.indice);

      fetch("/api/auth/guardarRuta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: quedadas[indice].idruta }),
      })
        .then((r) => {
          if (!r.ok) {
            throw new Error("Error al guardar la ruta");
          } else {
            return r.json();
          }
        })
        .then((r) => {
          rutas.push(r);
          console.log(rutas);
          misRutas.insertAdjacentHTML(
            "beforeend",
            htmlRuta(rutas[rutas.length - 1], rutas.length - 1),
          );
        })
        .catch((err) => {
          console.log(err);
        });
    });

    //boton de cerrar el mapa

    cerrarMapa.addEventListener("click", () => {
      contenedorMapa.style.display = "none";
    });

    //Si se pulsa el botón de apuntarse o desapuntarse, se envía la petición al back y se borra la quedada del tablón

    if (event.target.classList.contains("unirse")) {
      const indice = parseInt(event.target.dataset.indice);
      const idQuedada = quedadas[indice].id;
      const apuntado = quedadas[indice].apuntado;

      fetch("/api/auth/unirseQuedada", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: idQuedada, apuntado: apuntado }),
      })
        .then((r) => {
          if (!r.ok) {
            throw new Error("Error al desapuntarse a la quedada");
          } else {
            event.target.parentElement.parentElement.remove();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });

  //Cargamos las rutas guardadas del usuario desde el back y las mostramos en la sección mis rutas

  let rutas = [];

  fetch("/api/auth/obtenerRutas")
    .then((r) => {
      if (!r.ok) {
        throw new Error("No se han podido obtener las rutas guardadas");
      }
      return r.json();
    })
    .then((r) => {
      rutas = r;

      for (let i = 0; i < rutas.length; i++) {
        if (rutas[i].guardada) {
          misRutas.insertAdjacentHTML("beforeend", htmlRuta(rutas[i], i));
        }
      }
    })
    .catch((err) => {
      misRutas.innerText = err.message;
      console.log(err);
    });

  //Capturamos los clics en el mis rutas para añadir las funciones a los botones de las rutas

  misRutas.addEventListener("click", (event) => {
    //si se pulsa ver ruta se muestra el mapa con la ruta

    if (event.target.classList.contains("verRuta")) {
      contenedorMapa.style.display = "block";

      const indice = parseInt(event.target.dataset.indice);

      mapa.setView(rutas[indice].ruta.coordenadas[0], 15);
      cargarMapa(mapa, rutas[indice].actividad);
      L.polyline(rutas[indice].ruta.coordenadas, {
        color: "#bbff00",
        weight: 6,
      }).addTo(mapa);
    }

    //Boton de cerrar el mapa

    cerrarMapa.addEventListener("click", () => {
      contenedorMapa.style.display = "none";
    });

    //Si se pulsa el botón de descartar, se envía la petición al back para eliminar la ruta y se borra la ruta del tablón

    if (event.target.classList.contains("descartar")) {
      const indice = parseInt(event.target.dataset.indice);
      const idRuta = rutas[indice].id;

      fetch("/api/auth/eliminarRuta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: idRuta }),
      })
        .then((r) => {
          if (!r.ok) {
            throw new Error("Error al eliminar la ruta");
          } else {
            rutas.splice(indice, 1);
            event.target.parentElement.remove();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }

    //Si se pulsa reutilizar ruta, se redirige a la pagina de crear quedada con el id de la ruta en la url para poder cargarla en crear quedada

    if (event.target.classList.contains("reutilizar")) {
      const indice = parseInt(event.target.dataset.indice);
      const idRuta = rutas[indice].id;

      window.location.href = `/crearQuedada.html?idRuta=${idRuta}`;
    }
  });
});
