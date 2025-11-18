const mosquito = document.getElementById("mosquito");

let bottom = 90;
let velocity = 0;
const gravity = -0.25;     // cae 
const jumpForce = 0.8;   // sube 

let spacePressed = false;

// Limites de la pantalla donde se mueve le mosquito
const floor = 100;
const ceiling = 620;

// Parallax dinámico
let parallaxActive = true;
let bgX = 0;
const parallaxSpeed = 1.5;

// KEY DOWN (cuando se PRESIONA o se MANTIENE)
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        spacePressed = true;
    }
});

// KEY UP (cuando se suelta)
document.addEventListener("keyup", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        spacePressed = false;
    }
});

function update() {

    // si está apretado space el mosquito sube
    if (spacePressed) {
        velocity += jumpForce;
        parallaxActive = true; // el fondo avanza
    }

    // gravedad
    velocity += gravity;
    bottom += velocity;

    // piso
    if (bottom <= floor) {
        bottom = floor;
        velocity = 0;
        parallaxActive = false; // el fondo se para
    }

    // techo
    if (bottom > ceiling) {
        bottom = ceiling;
        velocity = 0;
    }

    mosquito.style.bottom = bottom + "px";

    if (parallaxActive) {
    bgX -= parallaxSpeed; // 🔁 velocidad del parallax
    }
    document.body.style.backgroundPosition = `${bgX}px 0px`;

    requestAnimationFrame(update);
}

update();
