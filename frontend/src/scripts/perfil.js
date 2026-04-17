import iniciarNav from "./shared/nav.js";
import { selectorRegion, obtenerRegiones } from "./shared/region.js";

document.addEventListener("DOMContentLoaded", () => {
  iniciarNav();
  selectorRegion();

  const form = document.getElementById("formPerfil");
  const guardarAvatar = document.getElementById("guardarAvatar");
  const actualizarPerfil = document.getElementById("actualizarPerfil");

  const avatar = document.getElementById("fotoPerfil");
  const vistaPrevia = document.getElementById("vistaPrevia");
  const feedbackDialog = document.getElementById("feedbackDialog");
  const respuestaDialog = document.getElementById("respuestaDialog");
  const cerrarDialog = document.getElementById("cerrarDialog");

  //Definimos una función para mostrar los mensajes de feedback de error / éxito al usuario

  function mostrarDialog(mensaje) {
    respuestaDialog.textContent = mensaje;
    feedbackDialog.showModal();
  }

  //Dado que partes de la validación requerirían hacer peticiones al back, he preferido no hacerlas en front y duplicarlas en back, por lo que voy a usar los mensajes de error del back para el feedback, asique defino una función para leerlas y si no las hay, dar un mensaje estandar

  function leerRespuesta(res, mensajeEstandar) {
    return res.json()
      .then(datos => ({
        ok: res.ok,
        mensaje: datos?.message || mensajeEstandar,
        datos,
      }))
      .catch(() => ({
        ok: res.ok,
        mensaje: mensajeEstandar,
        datos: null,
      }));
  }

  cerrarDialog.addEventListener("click", () => {
    feedbackDialog.close();
  });

  //Cargamos el avatar del usuario en caso de tenerlo

  fetch("/api/auth/urlAvatar?id=undefined")
    .then((res) => leerRespuesta(res, "error al cargar los avatares"))
    .then(({ ok, mensaje, datos }) => {
      if (!ok) {
        mostrarDialog(mensaje);
        return;
      }

      if (datos?.[0]?.avatar_url) {
        vistaPrevia.src = datos[0].avatar_url;
      }
    })
    .catch(() => {
      mostrarDialog("error al cargar los avatares");
    });

  //Cargamos los datos del usuario en los campos correspondientes

  fetch("/api/auth/datosUsuario")
    .then((res) => leerRespuesta(res, "No se han podido obtener los datos de usuario"))
    .then(({ ok, mensaje, datos }) => {
      if (!ok) {
        mostrarDialog(mensaje);
        return;
      }

      form.usuario.value = datos.usuario;
      form.nombre.value = datos.nombre;
      form.email.value = datos.email;
      form.fechaNacimiento.value = datos.fecha_nacimiento.split("T")[0];
      form.pais.value = datos.codigo_pais;
      obtenerRegiones(datos.codigo_pais)
        .then(() => {
          form.region.value = datos.region_id;
        });
    })
    .catch(() => {
      mostrarDialog("No se han podido obtener los datos de usuario");
    });

  //Cuando el usuario carga una imagen para el avatar, la mostramos en la vista previa

  avatar.addEventListener("change", () => {
    const file = avatar.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    vistaPrevia.src = url;
  });

  //Enviamos al back la imagen para que se guarde en supabase

  guardarAvatar.addEventListener("click", () => {
    if (avatar.files.length != 0) {
      const imagen = new FormData();
      imagen.append("avatar", avatar.files[0]);

      fetch("/api/auth/cambiarAvatar", {
        method: "PUT",
        body: imagen,
      })
        .then((res) => leerRespuesta(res, "No se ha podido subir el avatar"))
        .then(({ mensaje }) => {
          mostrarDialog(mensaje);
        })
        .catch(() => {
          mostrarDialog("No se ha podido subir el avatar");
        });
    }
  });

  //Realizamos la verificaciones de datos y enviamos los datos al back para modificar el perfil de usuario

  actualizarPerfil.addEventListener("click", () => {
    //Lo primero definimos una variable de control para verificar si los datos se pueden o no enviar al back

    let datosCorrectos = true;

    //Definimos las regex para correo y password

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w]).{10,}$/;

    //Comprobamos si se está intentando cambiar la contraseña, y si es así, que las nuevas coincidan y que pasen la regex

    if (
      form.pass.value != "" ||
      form.newPass.value != "" ||
      form.confirmNewPass.value != ""
    ) {
      if (form.newPass.value === form.confirmNewPass.value) {
        if (!passRegex.test(form.newPass.value)) {
          datosCorrectos = false;
          mostrarDialog(
            "La contraseña debe tener al menos 10 caracteres una mayúscula una minúscula un número y un caracter especial",
          );
        }
      } else {
        datosCorrectos = false;
        mostrarDialog("las contraseñas no coinciden");
      }
    }

    //Comprobamos también que el email pase la regex

    if (!emailRegex.test(form.email.value)) {
      datosCorrectos = false;
      mostrarDialog("formato de email incorrecto");
    }

    if (datosCorrectos) {
      fetch("/api/auth/modificarPerfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre.value,
          usuario: form.usuario.value,
          email: form.email.value,
          pass: form.pass.value,
          newPass: form.newPass.value,
          nacimiento: form.fechaNacimiento.value,
          region: form.region.value,
        }),
      })
        .then((res) => leerRespuesta(res, "No se ha podido modificar el perfil"))
        .then(({ mensaje }) => {
          mostrarDialog(mensaje);
        })
        .catch(() => {
          mostrarDialog("No se ha podido modificar el perfil");
        });
    }
  });
});
