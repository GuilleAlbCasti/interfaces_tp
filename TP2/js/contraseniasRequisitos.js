const passwordInput = document.getElementById('password');
const rePasswordInput = document.getElementById('re-password');
const rulesSpan = document.getElementById('password-rules');
const mensajeError = document.getElementById('mensajeError');

const patronesEvidentes = [
    '1234', '123456', 'qwerty', 'password', 'abcdef', '111111', '000000'
];

passwordInput.addEventListener('input', () => {
    const pwd = passwordInput.value;

    // Reglas
    const regla1 = pwd.length >= 8;
    const regla2 = /[a-zA-Z]/.test(pwd) && /[0-9]/.test(pwd);
    const regla3 = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const regla4 = !patronesEvidentes.some(p => pwd.toLowerCase().includes(p));

    // Actualizar visualmente las reglas
    rulesSpan.innerHTML = `
        <ul id="password-rules">
            <li class="label-alternativo" style="color:${regla1 ? '#54FF4B' : '#F22C2C'}">
                ${regla1 ? '✔' : '⚠️'} La contraseña debe tener al menos 8 caracteres.
            </li>
            <li class="label-alternativo" style="color:${regla2 ? '#54FF4B' : '#F22C2C'}">
                ${regla2 ? '✔' : '⚠️'} La contraseña debe tener letras y números.
            </li>
            <li class="label-alternativo" style="color:${regla3 ? '#54FF4B' : '#F22C2C'}">
                ${regla3 ? '✔' : '⚠️'} La contraseña debe incluir un carácter especial.
            </li>
            <li class="label-alternativo" style="color:${regla4 ? '#54FF4B' : '#F22C2C'}">
                ${regla4 ? '✔' : '⚠️'} La contraseña debe evitar usar patrones evidentes.
            </li>
        </ul>
    `;

    // Habilitar o bloquear campo "Repetir contraseña"
    const cumpleTodo = regla1 && regla2 && regla3 && regla4;
    rePasswordInput.disabled = !cumpleTodo;

    // Ocultar mensaje de error si empieza a corregir
    if (cumpleTodo) {
        mensajeError.style.display = "none";
    }
});

const form = document.querySelector('.registro-marco-principal-cuerpo-form');
form.addEventListener('submit', (e) => {
    const pwd = passwordInput.value;
    const rePwd = rePasswordInput.value;

    const regla1 = pwd.length >= 8;
    const regla2 = /[a-zA-Z]/.test(pwd) && /[0-9]/.test(pwd);
    const regla3 = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const regla4 = !patronesEvidentes.some(p => pwd.toLowerCase().includes(p));

    // comprueba que ambas contraseñas coincidan
    const coincide = pwd === rePwd;

    if (!(regla1 && regla2 && regla3 && regla4 && coincide)) {
        e.preventDefault();
        mensajeError.style.display = "block";
        mensajeError.textContent = coincide
            ? "⚠️ La contraseña no cumple todos los requisitos."
            : "⚠️ Colocaste una contraseña distinta a la anterior.";
        rePasswordInput.focus();
    } else {
        mensajeError.style.display = "none";
    }
});
