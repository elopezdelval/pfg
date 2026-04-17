import { selectorRegion } from "./shared/region.js";

document.addEventListener("DOMContentLoaded", () => {
  selectorRegion();

  //capturamos los elementos del DOM necesarios para el registro

  const form = document.getElementById("formRegistro");
  const error = document.getElementsByClassName("error");
  const feedbackDialog = document.getElementById("feedbackDialog");
  const respuestaDialog = document.getElementById("respuestaDialog");
  const cerrarDialog = document.getElementById("cerrarDialog");

  //Definimos una función para mostrar los mensajes de feedback de error / éxito al usuario y el listener para cerrar el dialog
  
  function mostrarDialog(mensaje) {
    respuestaDialog.textContent = mensaje;
    feedbackDialog.showModal();
  }

  cerrarDialog.addEventListener("click", () => {
    feedbackDialog.close();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    //definimos las regex y marcamos el formulario como válido a la espera de las validaciones

    let formularioValido = true;
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w]).{10,}$/;

    //limpiamos los mensajes de error

    for (let mensaje of error) {
      mensaje.textContent = "";
    }

    //usamos la validación de html para campos requeridos y pasamos las validaciones

    if (!form.checkValidity()) {
      mostrarDialog("Los campos marcados con un * son obligatorios");
    } else {

    //lo primero confirmamos que el nombre no está en uso y a partir de ahí las regex y la política

      fetch(`api/buscarNombre?usuario=${form.usuario.value}`)
        .then((res) => {
          if (!res.ok) {
            error[0].textContent = "El nombre escogido no está disponible";
            formularioValido = false;
            return;
          } else {
            if (!emailRegex.test(form.email.value)) {
              error[1].textContent = "Formato de correo electrónico incorrecto";
              formularioValido = false;
            }
            if (!passRegex.test(form.pass.value)) {
              error[2].textContent =
                "La contraseña debe tener al menos 10 caracteres una mayúscula una minúscula un número y un caracter especial";
              formularioValido = false;
            }
            if (!form.privacidad.checked) {
              error[3].textContent = "Debe aceptar la política de privacidad";
              formularioValido = false;
            }

            //si todo está en orden, enviamos los datos al backend

            if (formularioValido) {
              fetch("api/registrarUsuario", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  nombre: form.nombre.value,
                  usuario: form.usuario.value,
                  email: form.email.value,
                  pass: form.pass.value,
                  nacimiento: form.fecha_nacimiento.value,
                  region: form.region.value
                }),
              })
              .then(res => {
                if (res.ok) {
                    mostrarDialog("usuario registrado correctamente");
                } else {
                    mostrarDialog("error en el servidor");
                }
                return
              })
              .catch(() => {
                mostrarDialog("error de red");
              })
            }
          }
        })
        .catch(() => {
          formularioValido = false;
          mostrarDialog("Error de red");
        });
    }
  });
});
