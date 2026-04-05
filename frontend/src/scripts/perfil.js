import urlAvatar from "./shared/cargarAvatar.js";
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

  //Cargamos el avatar del usuario en caso de tenerlo

  urlAvatar().then((r) => {
    if (r[0].avatar_url) {
      vistaPrevia.src = r[0].avatar_url;
    }
  });

  //Cargamos los datos del usuario en los campos correspondientes

  fetch("/api/auth/datosUsuario")
    .then((r) => {
      if (!r.ok) {
        throw new Error("No se han podido obtener los datos de usuario");
      }
      return r.json();
    })
    .then((datos) => {
      form.usuario.value = datos.usuario;
      form.nombre.value = datos.nombre;
      form.email.value = datos.email;
      form.fechaNacimiento.value = datos.fecha_nacimiento.split("T")[0];
      form.pais.value = datos.codigo_pais;
      obtenerRegiones(datos.codigo_pais)
        .then((r) => {
          form.region.value = datos.region_id;
        })
        .catch((err) => console.log(err));
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
          console.log(
            "La contraseña debe tener al menos 10 caracteres una mayúscula una minúscula un número y un caracter especial",
          );
        }
      } else {
        datosCorrectos = false;
        console.log("las contraseñas no coinciden");
      }
    }

    //Comprobamos también que el email pase la regex

    if (!emailRegex.test(form.email.value)) {
      datosCorrectos = false;
      console.log("formato de email incorrecto");
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
      .then((r) => {
        if (!r.ok) {
            console.log('error modificar los datos')
        } else {
            console.log('datos mofidicados correctamente')
        }
      })
      .catch(err => {
        console.log(err);
      })
    }
  });
});
