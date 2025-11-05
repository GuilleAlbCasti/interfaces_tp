//Menú Hamburguesa

let btnMenu = document.querySelector("#btn-menu");
let menu = document.querySelector("#menu");
let icon = document.querySelector("#menu-icon");

btnMenu.addEventListener('click', verMenu);

function verMenu() {
    menu.classList.toggle("nav-li-cerrar");
   
    // Alternar imagen
    const abierto = "../img/menu-abierto.png";
    const cerrado = "../img/menu-cerrado.png";
    icon.src = icon.src.includes("menu-abierto") ? cerrado : abierto;
}  

//Banner Gamer
let btnBanner = document.querySelector("#btn-banner");
let banner = document.querySelector("#banner");   

// Event listener para el botón del banner
if (btnBanner && banner) {
    btnBanner.addEventListener('click', function(e) {
        e.stopPropagation(); // Evita que se propague el evento
        verBanner();
    });

    // Event listener para cerrar el banner al hacer clic fuera
    document.addEventListener('click', function(e) {
        // Si el clic no es en el banner ni en el botón, cerrar el banner
        if (!banner.contains(e.target) && !btnBanner.contains(e.target)) {
            cerrarBanner();
        }
    });

    // Event listener para evitar que el banner se cierre al hacer clic dentro de él
    banner.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

function verBanner() {
    if (banner) {
        banner.classList.toggle("banner-cerrar");
        // También agregar/quitar clase al header para desplazar el logo (solo mobile)
        const header = document.querySelector("header");
        if (banner.classList.contains("banner-cerrar")) {
            header.classList.add("banner-activo");
        } else {
            header.classList.remove("banner-activo");
        }
    }
}

function cerrarBanner() {
    if (banner) {
        banner.classList.remove("banner-cerrar");
        // Quitar clase del header cuando se cierra el banner
        const header = document.querySelector("header");
        header.classList.remove("banner-activo");
    }
}

//Carrito de compras
let btnCarrito = document.querySelector("#btn-carrito");
let carrito = document.querySelector(".carrito"); // Corregido: usar clase en lugar de ID
let cartForm = document.querySelector("#cartForm");

if (btnCarrito && carrito && cartForm) {
    btnCarrito.addEventListener('click', efectoCarrito);
    
    // Cerrar formulario al enviar (submit)
    const form = cartForm.querySelector('form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevenir el envío real del formulario
            cartForm.classList.add('hidden');
           
        });
    }
}

function efectoCarrito() {
    carrito.classList.add('cart-animate');

    // Después de la animación, mostrar el formulario
    setTimeout(() => {
        carrito.classList.remove('cart-animate');
        // Mostrar el formulario del carrito
        cartForm.classList.remove('hidden');
    }, 1200);
}

