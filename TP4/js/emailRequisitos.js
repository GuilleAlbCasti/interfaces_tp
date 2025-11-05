
const emailInput = document.getElementById("email");
const mensajeErrorEmail = document.getElementById("mensajeErrorEmail");
const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mientras escribe
emailInput.addEventListener("input", function () {
    const emailValor = emailInput.value.trim();

    if (!regexEmail.test(emailValor)) {
        mensajeErrorEmail.style.display = "block";
        mensajeErrorEmail.textContent = "⚠️ Para que sea válido debe contener: @ / .com";
    } else {
        mensajeErrorEmail.style.display = "none";
        emailInput.style.border = "";
    }
});

// Cuando intenta salir del input
emailInput.addEventListener("blur", function (e) {
    const emailValor = emailInput.value.trim();
    if (!regexEmail.test(emailValor)) {
        mensajeErrorEmail.style.display = "block";
        mensajeErrorEmail.textContent = "❌ Email inválido, vuelva a intentarlo.";
        mensajeErrorEmail.style.color = "#F22C2C";
        emailInput.focus();
    }
});
