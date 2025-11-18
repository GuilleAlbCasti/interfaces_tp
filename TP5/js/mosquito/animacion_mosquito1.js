const mosquito = document.getElementById("mosquito");

let bottom = 150;
let velocity = 0;
const gravity = -0.25;
const jumpForce = 0.8;

let spacePressed = false;

// Límites
const floor = 100;
const ceiling = 620;

// Capas
const layers = [
    { el: document.getSelection(".layer-1"), speed: 0.5, x: 0 },
    { el: document.getSelection(".layer-2"), speed: 1.0, x: 0 },
    { el: document.getSelection(".layer-3"), speed: 1.5, x: 0 },
    { el: document.getSelection(".layer-4"), speed: 2.0, x: 0 },
    { el: document.getSelection(".layer-5"), speed: 2.5, x: 0 },
];

let parallaxActive = true;

// INPUT
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        spacePressed = true;
    }
});
document.addEventListener("keyup", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        spacePressed = false;
    }
});

function update() {

    if (spacePressed) {
        velocity += jumpForce;
        parallaxActive = true;
    }

    velocity += gravity;
    bottom += velocity;

    // Piso
    if (bottom < floor) {
        bottom = floor;
        velocity = 0;
        parallaxActive = false; // 👉 acá se frena el parallax
    }

    // Techo
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
