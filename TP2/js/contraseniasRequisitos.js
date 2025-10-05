const passwordInput = document.getElementById('password');
const rulesSpan = document.getElementById('password-rules');

const patronesEvidentes = [
    '1234', '123456', 'qwerty', 'password', 'abcdef', '111111', '000000'
];

passwordInput.addEventListener('input', () => {
    const pwd = passwordInput.value;

    // Regla 1: al menos 8 caracteres
    const regla1 = pwd.length >= 8;

    // Regla 2: letras y números
    const regla2 = /[a-zA-Z]/.test(pwd) && /[0-9]/.test(pwd);

    // Regla 3: carácter especial
    const regla3 = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    // Regla 4: evitar patrones evidentes
    const regla4 = !patronesEvidentes.some(p => pwd.toLowerCase().includes(p));

    // Construir el HTML actualizado con colores
    rulesSpan.innerHTML = `
        <ul style="padding-left: 20px; margin: 0;">
            <li>${regla1 ? '<span style="color:green">✔</span>' : '<span style="color:red">✖</span>'} La contraseña debe tener al menos 8 caracteres</li>
            <li>${regla2 ? '<span style="color:green">✔</span>' : '<span style="color:red">✖</span>'} Contener letras y números</li>
            <li>${regla3 ? '<span style="color:green">✔</span>' : '<span style="color:red">✖</span>'} Incluir un carácter especial</li>
            <li>${regla4 ? '<span style="color:green">✔</span>' : '<span style="color:red">✖</span>'} Evitar patrones evidentes</li>
        </ul>
`;
});
