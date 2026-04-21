document.addEventListener("DOMContentLoaded", () => {
  const entrar = document.getElementById("entrar");
  const form = document.getElementById("formularioEntrada");
  const registrarse = document.getElementById("registrarse");
  const cambiarFormulario = document.getElementById("cambioForm");
  const feedbackDialog = document.getElementById("feedbackDialog");
  const respuestaDialog = document.getElementById("respuestaDialog");
  const cerrarDialog = document.getElementById("cerrarDialog");

  //Definimos una función para mostrar el dialog de feedback y añadimos el listener al boton de cerrar

  function mostrarDialog(mensaje) {
    respuestaDialog.textContent = mensaje;
    feedbackDialog.showModal();
  };

  cerrarDialog.addEventListener("click", () => {
    feedbackDialog.close();
  });

  //Al entrar en la página se activan las animaciones de entrada

  entrar.addEventListener("click", (event) => {
    event.preventDefault();
    recuperarPass.style.display = "none";
    form.style.display = "block";
    form.style.animation = "opacidad 2s ease reverse both";
  });
  registrarse.addEventListener("click", (event) => {
    window.location.href = "/registro.html";
  });

  const formulario = document.getElementById("formularioEntrada");

  //Lógica de login

  formulario.addEventListener("submit", (event) => {
    event.preventDefault();

    //Validamos que estén rellenos los campos y hacemos la petición al back para el login
    
    if (!formulario.checkValidity()) {
      mostrarDialog("Introduzca sus credenciales para acceder");
    } else {
      fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario: formulario.usuario.value,
          pass: formulario.pass.value,
        }),
      })
        .then((res) => {
          if (!res.ok) {
            mostrarDialog("Credenciales incorrectas");
          } else {
            window.location.href = "../../tablon.html";
          }
        })
        .catch(() => {
          mostrarDialog("Error de red");
        });
    }
  });

  cambiarFormulario.addEventListener("click", (event) => {
    event.preventDefault();
    form.style.display = "none";
    recuperarPass.style.display = "block";
    recuperarPass.style.animation = "opacidad 2s ease reverse both";
  });

  const recuperarPass = document.getElementById("recuperarPass");
  const enviarPass = document.getElementById("enviarPass");

  enviarPass.addEventListener("click", () => {
    fetch("/api/recuperarPass", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
          usuario: recuperarPass.recuperarUsuario.value
        })
    })
    .then(r => r.json())
    .then(info => {
      mostrarDialog(`${info.message}`);
    })
    .catch(err => {
      mostrarDialog(`${err.message}`);
    })
  });
});
