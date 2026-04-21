import { selectorRegion } from "./shared/region.js";

document.addEventListener("DOMContentLoaded", () => {
  selectorRegion();

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

  //capturamos los elementos del DOM necesarios para el registro

  const form = document.getElementById("formRegistro");
  const error = document.getElementsByClassName("error");

  //definimos las regex y definimos una variable para controlar la validez de los formularios

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w]).{10,}$/;
  
  let formularioValido = true;

  form.addEventListener("submit", (event) => {
    event.preventDefault();


    formularioValido = true;

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
              error[2].textContent = "La contraseña debe tener al menos 10 caracteres una mayúscula una minúscula un número y un caracter especial";
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
          mostrarDialog("Error de red");
        });
    }
  });

  const formPass = document.getElementById("formCambiarPass");
  const titulo = document.getElementsByClassName("tituloPagina")[0];

  //Verificamos si la url contiene parámetros para el cambio de contraseña, y si es así, ocultamos el formulario de registro y mostramos el de cambio de contraseña

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const token = urlParams.get("token");

  if (id && token) {
    titulo.textContent = "Introduzca su nueva contraseña";
    form.style.display = "none";
    formPass.style.display = "block";
  }

  //Capturamos el submit del formulario de cambio de contraseña, validamos los campos y si está todo bien, llamamos al back para cambiar la contraseña

  formPass.addEventListener("submit", (event) => {
    event.preventDefault();

    formularioValido = true;

    if (!passRegex.test(formPass.nuevoPass.value)) {
      error[4].textContent = "La contraseña debe tener al menos 10 caracteres una mayúscula una minúscula un número y un caracter especial";
      formularioValido = false;
    }
    if (formPass.nuevoPass.value != formPass.confirmarPass.value) {
      error[5].textContent = "Las contraseñas no coinciden";
      formularioValido = false;
    }
    
    if (formularioValido) {
      fetch("/api/cambiarPass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: id,
          token: token,
          nuevoPass: formPass.nuevoPass.value,
          confirmarPass: formPass.confirmarPass.value
        })
      })
      .then(r => {
        if (r.ok) {
          mostrarDialog("Contraseña cambiada correctamente")
          setTimeout(() => {
            window.location.href = "/index.html";
          }, 4000);
        }
        else {
          mostrarDialog(r.message);
        }
      })
      .catch(err => {
        mostrarDialog("Error de red");
      })
    }
  })
});
