//Aquí cargamos los paises y añadimos un listener para cargar las provincias para el elector de provincias/regiones

export function selectorRegion() {
  const pais = document.getElementById("pais");
  const region = document.getElementById("region");

  fetch("/api/obtenerPaises")
    .then((res) => {
      if (!res.ok) {
        throw new Error("error al cargar los paises");
      }
      return res.json();
    })
    .then((paises) => {
      for (const p of paises) {
        const linea = document.createElement("option");
        linea.value = p.codigo;
        linea.textContent = p.nombre;

        pais.appendChild(linea);
      }
    });

  region.disabled = true;

  pais.addEventListener("change", () => {
    obtenerRegiones(pais.value);
  });
}

//Llamamos al back para cargar las provincias de la base de datos en función del valor de pais que pasemos
export function obtenerRegiones(pais) {
  const region = document.getElementById("region");

  return fetch(`/api/obtenerRegiones?pais=${pais}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("error al cargar las provincias");
      }
      return res.json();
    })
    .then((provincias) => {
      //Cargamos todas las regiones como option en el select regiones y lo activamos
      region.innerHTML = '<option disabled selected>Elige tu region</option>';
      
      for (const provincia of provincias) {
        const linea = document.createElement("option");
        linea.value = provincia.id;
        linea.textContent = provincia.nombre;

        region.appendChild(linea);
      }
      
      region.disabled = false;
    })
    .catch((err) => console.log(err));
}
