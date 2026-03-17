document.addEventListener('DOMContentLoaded', ()=>{
    const entrar = document.getElementById('entrar');
    const form = document.getElementById('formularioEntrada');
    const registrarse = document.getElementById('registrarse')

    entrar.addEventListener('click', (event)=>{
        event.preventDefault();
        form.style.animation = 'opacidad 2s ease reverse both';
    })
    registrarse.addEventListener('click', (event) =>{
        window.location.href = '/registro.html';
    })

    const formulario = document.getElementById('formularioEntrada');
    const alerta = document.getElementById('alerta');
    
    formulario.addEventListener('submit', (event) => {
        event.preventDefault();

        alerta.textContent = '';

        if (!formulario.checkValidity()) {
            alerta.textContent = 'Introduzca sus credenciales para acceder';
        } else {
            fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario: formulario.usuario.value,
                    pass: formulario.pass.value
                })
            })
            .then(res => {
                if (!res.ok) {
                    alerta.textContent = 'Credenciales incorrectas';
                } else {
                    window.location.href = '../../tablon.html';
                }
            })
            .catch(err => {
                console.log(err);
                alerta.textContent = 'Error de red';
            })
        }
    });
});