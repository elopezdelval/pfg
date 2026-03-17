import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iniciarNav from "./shared/nav.js";
import { selectorRegion, obtenerRegiones }from "./shared/region.js";
import cargarMapa from "./shared/cargarMapa.js";
import htmlQuedada from "./shared/htmlQuedada.js";

document.addEventListener("DOMContentLoaded", () => {
  iniciarNav();
  selectorRegion();

  //Menú de filtros desplegable

  const filtroDesplegable = document.getElementById("filtros-container");
  const leyenda = document.getElementById("leyenda");

  filtroDesplegable.style.display = "none";
  leyenda.addEventListener("click", () => {
    if (filtroDesplegable.style.display == "none") {
      filtroDesplegable.style.display = "grid";
    } else {
      filtroDesplegable.style.display = "none";
    }
  });

  //Cargamos todas las quedadas que hay en la base de datos y que tengan una fecha que no haya pasado

  const tablon = document.getElementById("quedadas");
  let quedadas = [];

  //Definimos una función para pintar las quedadas con las propieadades del objeto que se pase como parámetro
  //introducimos data-indice en los botones para saber a que posición del array se corresponde la quedada

  let apuntarse = "";

  fetch("/api/auth/obtenerQuedadas")
    .then((r) => {
      if (!r.ok) {
        throw new Error("No se han podido obtener las quedadas");
      }
      return r.json();
    })
    .then((r) => {
      //guardamos todas las quedadas para poder filtrar y mostrar los mapas y pintamos las quedadas en el tablon

      quedadas = r;

      for (let i = 0; i < quedadas.length; i++) {
        //En el botón ponemos apuntarse o desapuntarse dependiendo de si el está o no apuntado
        if (quedadas[i].apuntado) {
          apuntarse = "desapuntarse";
        } else {
          apuntarse = "apuntarse";
        }

        //si el usuario no tiene avatar cargamos el avatar por defecto
        if (quedadas[i].avatar_url === null){ 
          quedadas[i].avatar_url = '/img/avatar.png';
        }

        tablon.insertAdjacentHTML(
          "beforeend",
          htmlQuedada(quedadas[i], i, apuntarse),
        );
      }
    })
    .catch((err) => {
      tablon.innerText = err.message;
      console.log(err);
    });

  //Aplicamos filtros y volvemos a pintar las quedadas en el tablón
  const formFiltrar = document.getElementById("filtros");
  const botonFiltrar = document.getElementById("botonFiltrar");

  botonFiltrar.addEventListener("click", () => {
    tablon.innerHTML = "";
    for (let i = 0; i < quedadas.length; i++) {
      if (
        //Si se cumple alguna de las condiciones no pintamos la quedada
        !(
          (formFiltrar.region.value != "" &&
            formFiltrar.region.options[formFiltrar.region.selectedIndex].text !=
              quedadas[i].region) ||
          (formFiltrar.actividad.value != "" &&
            formFiltrar.actividad.value != quedadas[i].actividad) ||
          (formFiltrar.desde.value != "" &&
            formFiltrar.desde.value > quedadas[i].fecha) ||
          (formFiltrar.hasta.value != "" &&
            formFiltrar.hasta.value < quedadas[i].fecha)
        )
      ) {
        if (quedadas[i].apuntado) {
          apuntarse = "desapuntarse";
        } else {
          apuntarse = "apuntarse";
        }
        tablon.insertAdjacentHTML(
          "beforeend",
          htmlQuedada(quedadas[i], i, apuntarse),
        );
      }
    }
  });

  const mapa = L.map("mapaTablon").setView([40.4168, -3.7038], 6);
  const contenedorMapa = document.getElementById("contenedorMapa");
  const cerrarMapa = document.getElementById("cerrarMapa");
  const guardarRuta = document.getElementById("guardarRuta");
  contenedorMapa.style.display = "none";

  //capturamos clicks en el tablon para manejar los botones de ver ruta y apuntarse

  tablon.addEventListener("click", (event) => {
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

    //si se pulsa guardar ruta dentro del mapa, enviamos la petición al back para guardarla.

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
        .then((r) => {console.log('ruta guardada:', r)})
        .catch((err) => {
          console.log(err);
        });
    });

    //boton para cerrar el mapa

    cerrarMapa.addEventListener("click", () => {
      contenedorMapa.style.display = "none";
    });

    //Si se pulsa el botón de apuntarse o desapuntarse, se envía la petición al back y se cambia el texto del botón y el estado de apuntado en la quedada

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
            throw new Error("Error al apuntarse/desapuntarse a la quedada");
          } else {
            quedadas[indice].apuntado = !apuntado;
            if (quedadas[indice].apuntado) {
              event.target.innerText = "desapuntarse";
            } else {
              event.target.innerText = "apuntarse";
            }
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
});
