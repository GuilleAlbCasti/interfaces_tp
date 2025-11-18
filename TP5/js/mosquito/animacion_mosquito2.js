const mosquito = document.getElementById("mosquito");

let bottom = 90;
let velocity = 0;
const gravity = -0.25;     // cae 
const jumpForce = 0.8;   // sube 

let spacePressed = false;

// Limites de la pantalla donde se mueve le mosquito
const floor = 100;
const ceiling = 620;

// Capas
const layers = [
    { el: document.querySelector(".layer-5"), speed: 0.5, x: 0 },
    { el: document.querySelector(".layer-4"), speed: 1.0, x: 0 },
    { el: document.querySelector(".layer-3"), speed: 1.5, x: 0 },
    { el: document.querySelector(".layer-2"), speed: 2.0, x: 0 },
    { el: document.querySelector(".layer-1"), speed: 2.5, x: 0 },
];

// Parallax dinámico
let parallaxActive = true;

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

    // ---- PARALLAX ----
    layers.forEach(layer => {
        if (parallaxActive) layer.x -= layer.speed;
        layer.el.style.transform = `translateX(${layer.x}px)`;
    });

    requestAnimationFrame(update);
}

update();
