import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iniciarNav from "./shared/nav.js";
import { selectorRegion, obtenerRegiones } from "./shared/region.js";
import caminoGH from "./shared/caminoGH.js";
import cargarMapa from "./shared/cargarMapa.js";


document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("formQuedada");
  const distanciaRuta = document.getElementById("distanciaRuta");
  const borrarTramo = document.getElementById("borrarTramo");
  const borrarTodo = document.getElementById("borrarTodo");
  const guardarQuedada = document.getElementById("crearQuedada");
  const feedback = document.getElementById("feedbackDialog");
  const alerta = document.getElementById("respuestaDialog");
  const cerrarDialog = document.getElementById("cerrarDialog");
  
  iniciarNav();
  selectorRegion();

  //Definimos una función para mostrar los mensajes de feedback de error / éxito al usuario y el listener para cerrar el dialog
  
  function mostrarDialog(mensaje) {
    alerta.textContent = mensaje;
    feedback.showModal();
  }

  cerrarDialog.addEventListener("click", () => {
    feedback.close();
  });

  let deporte = "foot";
  let coordAnterior = null;
  let distancia = 0;
  let distanciaTramos = [];
  let rutaCompleta = [];
  let linea = [];

  //Cargamos el contenedor del mapa inicialmente centrado en madrid
  const mapa = L.map("mapa").setView([40.4168, -3.7038], 6);

  //Verificamos si se accede a la página con id de ruta en la url y si es así, cargamos la ruta, si no, cargamos el mapa normal

  const urlParams = new URLSearchParams(window.location.search);
  const idRuta = urlParams.get("idRuta");

  if (idRuta) {
    fetch("/api/auth/obtenerRutas")
      .then((r) => {
        if (!r.ok) {
          throw new Error("Error al obtener la ruta");
        }
        return r.json();
      })
      .then((rutas) => {
        const ruta = rutas.find((r) => r.id == idRuta);

        //Lo primero cambiamos los datos del formulario definidos por la ruta

        distanciaRuta.innerText = `Distancia: ${(ruta.ruta.distancia / 1000).toFixed(1)}km`;
        form.actividad.value = ruta.actividad;
        form.pais.value = ruta.codigo_pais;
        obtenerRegiones(ruta.codigo_pais)
          .then((r) => {
            form.region.value = ruta.region_id;
          })
          .catch(() => {});

        //Lo segundo cargamos el layer que toque, dibujamos la ruta y ajustamos la vista a la ruta

        cambiarMapa(mapa, ruta.actividad);
        mapa.setView(ruta.ruta.coordenadas[0], 13);
        rutaCompleta = ruta.ruta.coordenadas;
        const tramo = L.polyline(rutaCompleta, {
          color: "#bbff00",
          weight: 6,
        }).addTo(mapa);

        //Lo tercero asignamos los valores a las variables para poder ampliar la ruta si así lo quiere el usuario

        linea.push(tramo);
        distancia = ruta.ruta.distancia;
        distanciaTramos.push(ruta.ruta.distancia);
        coordAnterior = {
          lat: ruta.ruta.coordenadas[ruta.ruta.coordenadas.length - 1][0],
          lng: ruta.ruta.coordenadas[ruta.ruta.coordenadas.length - 1][1],
        };
      })
      .catch(() => {
        cargarMapa(mapa, "");
      });
  } else {
    cargarMapa(mapa, "");
  }

  //Declaramos la función para cambiar/resetear el mapa

  function cambiarMapa() {
    if (form.actividad.value == "ciclismo") {
      deporte = "bike";

      cargarMapa(mapa, "ciclismo");
    } else if (form.actividad.value == "senderismo") {
      deporte = "foot"; //Este perfil sería hike en el plan de pago de GH, en el de prueba solo permite bike, car y foot

      cargarMapa(mapa, "senderismo");
    } else {
      //esto me vale tanto si no hay nada en el selector como si el deporte es running, ya que es el mapa que uso por defecto
      deporte = "foot";

      cargarMapa(mapa, "");
    }
    //Reseteamos todas las variables, ya que la ruta cambia dependiendo del deporte (GH optimiza el camino dependiendo del perfil)

    coordAnterior = null;
    distancia = 0;
    rutaCompleta.length = 0;
    linea.length = 0;
    distanciaTramos.length = 0;
  }

  //cambiamos la capa del mapa en función del deporte escogido

  form.actividad.addEventListener("change", () => {
    cambiarMapa();
  });

  //cargamos el icono de inicio

  const markerInicio = L.icon({
    iconUrl: "/img/marker.png",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  //capturamos los clicks en el mapa para ir generando la ruta

  mapa.addEventListener("click", (event) => {
    const coordActual = event.latlng;

    if (!coordAnterior) {
      //Si es el primer punto ponemos el icono de inicio y cargamos coordenada anterior
      coordAnterior = coordActual;
      L.marker(coordActual, { icon: markerInicio }).addTo(mapa);
    } else {
      caminoGH(coordAnterior, coordActual, deporte)
        .then((resGH) => {
          const puntos = resGH.coordenadas;
          const tramo = L.polyline(puntos, {
            color: "#bbff00",
            weight: 6,
          }).addTo(mapa);

          rutaCompleta.push(puntos);
          linea.push(tramo);
          coordAnterior = coordActual;

          distancia += resGH.distancia;
          distanciaTramos.push(resGH.distancia);
          distanciaRuta.innerText = `Distancia: ${(distancia / 1000).toFixed(1)}km`;
        })
        .catch((err) => {
          console.error(err);
          mostrarDialog("Error obteniendo el tramo");
        });
    }
  });

  //botón borrar tramo

  borrarTramo.addEventListener("click", () => {
    const ultimoTramo = linea[linea.length - 1];
    mapa.removeLayer(ultimoTramo);

    rutaCompleta.pop();
    linea.pop();
    coordAnterior = ultimoTramo.getLatLngs()[0];

    distancia -= distanciaTramos[distanciaTramos.length - 1];
    distanciaTramos.pop();
    distanciaRuta.innerText = `Distancia: ${(distancia / 1000).toFixed(1)}km`;
  });

  //botón borrar todo

  borrarTodo.addEventListener("click", () => {
    cambiarMapa();
  });

  //Guardar quedada

  guardarQuedada.addEventListener("click", () => {
    const ruta = {
      coordenadas: rutaCompleta.flat(),
      distancia: distancia,
    };
    const quedada = {
      region: form.region.value,
      actividad: form.actividad.value,
      fecha: form.fechaQuedada.value,
      ritmo: form.ritmo.value,
      descripcion: form.descripcion.value,
    };

    if (!Array.isArray(ruta.coordenadas) || ruta.coordenadas.length < 2) {
      mostrarDialog("La ruta debe incluir al menos dos coordenadas");
      return;
    }

    if (!quedada.fecha || !quedada.actividad || !quedada.region) {
      mostrarDialog("Fecha, actividad y región son campos obligatorios");
      return;
    }

    fetch("/api/auth/guardarQuedada", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ruta: ruta,
        quedada: quedada,
      }),
    })
      .then((r) => {
        if (!r.ok) {
          mostrarDialog("Error guardando la quedada, intentelo más tarde");
          throw new Error("Error guardando la quedada");
        }
        mostrarDialog("Quedada creada correctamente");
      })
      .catch(() => {});
  });
});
