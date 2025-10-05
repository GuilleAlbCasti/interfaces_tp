//Manejo de cards y carrouseles

//Arreglo global para almacenar los juegos
juegos = [];

//Lógica del loader
const loader = document.getElementById('loader');
window.addEventListener('load', () => {
  setTimeout(() => {
    loader.style.display = 'none';
  }, 5000);
});

// Función para cargar datos de juegos desde la API
async function cargarDatosDeJuegos() {
  const response = await fetch('https://vj.interfaces.jima.com.ar/api');
  const games = await response.json();
  if (response.ok) {
    games.forEach(game => {
      juegos.push(game);
    });
    console.log('Juegos cargados:', juegos);
  } else {
    console.error('Error al cargar los datos:', response.statusText);
  }
}
///////////////////////////////////CARDS///////////////////////////////////////////////////////////////////////////
// Función para mostrar los juegos en los carrouseles chicos en el DOM
async function mostrarJuegos(juegosXcaregoria, genero) {
  const main = document.getElementById('cards');
  const tituloCategoria = document.createElement('h2');
  tituloCategoria.textContent = "Categoria " + genero;
  main.appendChild(tituloCategoria);

  // Crear contenedor del carrusel
  const carruselContainer = document.createElement('div');
  carruselContainer.className = 'carousel-container';

  // Botón anterior
  const btnAnterior = document.createElement('button');
  btnAnterior.className = 'carousel-nav carousel-prev';
  btnAnterior.innerHTML = '<img src="img/flechaizquierda.svg" alt="Anterior">';

  // Contenedor de las cards
  const contenedorXcategoria = document.createElement('article');
  contenedorXcategoria.className = 'categoria';

  // Botón siguiente
  const btnSiguiente = document.createElement('button');
  btnSiguiente.className = 'carousel-nav carousel-next';
  btnSiguiente.innerHTML = '<img src="img/flechaderecha.svg" alt="Siguiente">';

  // Agregar elementos al carrusel chico
  carruselContainer.appendChild(btnAnterior);
  carruselContainer.appendChild(contenedorXcategoria);
  carruselContainer.appendChild(btnSiguiente);
  main.appendChild(carruselContainer);

  juegosXcaregoria.forEach(juego => {
    const juegoDiv = crearCard(juego, 'card');
    contenedorXcategoria.appendChild(juegoDiv);
  });

  // Configurar funcionalidad de los carrouseles chicos
  setupCarruselCategoria(contenedorXcategoria, btnAnterior, btnSiguiente);
}
// Función para configurar el carrusel de una categoría (versión simplificada)
function setupCarruselCategoria(contenedor, btnAnterior, btnSiguiente) {
  const cardWidth = 225; // Ancho de la carta + margenes
  const cards = contenedor.querySelectorAll('.card');

  // Navegar hacia adelante
  btnSiguiente.addEventListener('click', () => {
    // Aplicar efecto skew hacia la derecha
    cards.forEach(card => {
      card.classList.add('card-skew-right');
    });

    contenedor.scrollBy({ left: cardWidth * 2, behavior: 'smooth' });

    // Remover efecto después de la animación
    setTimeout(() => {
      cards.forEach(card => {
        card.classList.remove('card-skew-right');
      });
    }, 500);
  });

  // Navegar hacia atrás
  btnAnterior.addEventListener('click', () => {
    // Aplicar efecto skew hacia la izquierda
    cards.forEach(card => {
      card.classList.add('card-skew-left');
    });

    contenedor.scrollBy({ left: -cardWidth * 2, behavior: 'smooth' });

    // Remover efecto después de la animación
    setTimeout(() => {
      cards.forEach(card => {
        card.classList.remove('card-skew-left');
      });
    }, 500);
  });
}

// Función para generar estrellas de valoración
function generarEstrellas(rating) {
  const maxEstrellas = 5;
  const estrellasLlenas = Math.floor(rating); // Estrellas completas
  const tieneMedia = rating % 1 >= 0.5; // Si tiene media estrella
  let html = '<div class="rating-stars">';

  // Agregar estrellas llenas
  for (let i = 0; i < estrellasLlenas; i++) {
    html += '<span class="star star-full">★</span>';
  }

  // Agregar media estrella si corresponde
  if (tieneMedia && estrellasLlenas < maxEstrellas) {
    html += '<span class="star star-half">★</span>';
  }

  // Agregar estrellas vacías
  const estrellasVacias = maxEstrellas - estrellasLlenas - (tieneMedia ? 1 : 0);
  for (let i = 0; i < estrellasVacias; i++) {
    html += '<span class="star star-empty">★</span>';
  }

  html += `<span class="rating-number">${rating}</span>`;
  html += '</div>';
  return html;
}

function crearCard(juego, estilo) {
  const juegoDiv = document.createElement('div');
  // Harcodeo para agregar el peg solitaire espacial
  if (juego.name === "Portal 2") {
    juego.name = "Peg Solitaire Espacial";
    juego.background_image = "img/pegSolitaireEspacial.png";
    juegoDiv.className = estilo;
    juegoDiv.style.backgroundImage = `url('${juego.background_image}')`;
    juegoDiv.innerHTML = `
  <h2>${juego.name}</h2>
  ${(() => {
        let html = '<p> ';
        for (let i = 0; i < juego.genres.length; i++) {
          html += `${juego.genres[i].name} `;
        }
        return html + '</p>';
      })()}
  <p class="valoracion-label"></p>
  ${generarEstrellas(juego.rating)}
  <a href="html/juego.html" class="btn-ver-mas">Ver más</a>
  `;
  } else {
    juegoDiv.className = estilo;
    juegoDiv.style.backgroundImage = `url('${juego.background_image}')`;
    juegoDiv.innerHTML = `
  <h2>${juego.name}</h2>
  ${(() => {
        let html = '<p> ';
        for (let i = 0; i < juego.genres.length; i++) {
          html += `${juego.genres[i].name} `;
        }
        return html + '</p>';
      })()}
  <p class="valoracion-label"></p>
  ${generarEstrellas(juego.rating)}
  <button class="btn-ver-mas">Ver más</button>
  `;

  }

  return juegoDiv;
}
// Función para filtrar juegos por género
function juegosPorGenero(genero) {
  const juegosFiltrados = [];
  for (let i = 0; i < juegos.length; i++) {
    for (let j = 0; j < juegos[i].genres.length; j++) {
      if (juegos[i].genres[j].name.toLowerCase() === genero.toLowerCase()) {
        juegosFiltrados.push(juegos[i]);
      }
    }
  }
  return juegosFiltrados;
}
// Función para obtener los 10 juegos más valorados
function juegosMasValorados() {
  const temp = [...juegos]; // Crear copia del array
  temp.sort((a, b) => b.rating - a.rating);
  return temp.slice(0, 10);
}
// Función para mostrar los juegos más valorados en el carrousel grande
async function mostrarJuegosMasValorados() {
  const carrousel = document.getElementById('carrousel');
  const juegosTop = juegosMasValorados();
  juegosTop.forEach(juego => {
    const juegoDiv = crearCard(juego, 'carrousel-item');
    carrousel.appendChild(juegoDiv);
  });
}

// Función para inicializar la carga y visualización de juegos
async function inicializar() {

  await cargarDatosDeJuegos();
  await mostrarJuegosMasValorados();//carrousel grande

  await mostrarJuegos(juegosPorGenero('Adventure'), "Adventure");
  await mostrarJuegos(juegosPorGenero('Shooter'), "Shooter");
  await mostrarJuegos(juegosPorGenero('RPG'), "RPG");
  await mostrarJuegos(juegosPorGenero('Indie'), "Indie");
  
  // Inicializar botones de navegación del carrusel
  setupCarrouselButtons();

  
}




// Navegación simple con botones laterales del carrusel Grande
function setupCarrouselButtons() {
  const carrousel = document.getElementById('carrousel');
  const btnLeft = document.querySelector('.carrousel-btn-left');
  const btnRight = document.querySelector('.carrousel-btn-right');
  const wrapper = document.querySelector('.carrousel-wrapper');
  
  if (!carrousel || !btnLeft || !btnRight) return;

  // Agregar las flechas SVG a los botones
  btnLeft.innerHTML = '<img src="img/flechaizquierda.svg" alt="Anterior">';
  btnRight.innerHTML = '<img src="img/flechaderecha.svg" alt="Siguiente">';

  // Botón izquierdo - scroll hacia atrás
  btnLeft.addEventListener('click', () => {
    carrousel.scrollBy({ left: -350, behavior: 'smooth' });
    
    // Efecto de inclinación temporal
    if (wrapper) {
      wrapper.classList.add('scrolling-left');
      setTimeout(() => wrapper.classList.remove('scrolling-left'), 400);
    }
  });

  // Botón derecho - scroll hacia adelante
  btnRight.addEventListener('click', () => {
    carrousel.scrollBy({ left: 350, behavior: 'smooth' });
    
    // Efecto de inclinación temporal
    if (wrapper) {
      wrapper.classList.add('scrolling-right');
      setTimeout(() => wrapper.classList.remove('scrolling-right'), 400);
    }
  });
}

// Función para inicializar la carga y visualización de juegos
async function inicializar() {

  await cargarDatosDeJuegos();
  await mostrarJuegosMasValorados();//carrousel grande
  await mostrarJuegos(juegosPorGenero('Adventure'), "Adventure");
  await mostrarJuegos(juegosPorGenero('Shooter'), "Shooter");
  await mostrarJuegos(juegosPorGenero('RPG'), "RPG");
  await mostrarJuegos(juegosPorGenero('Indie'), "Indie");
  
  // Inicializar botones de navegación del carrusel
  setupCarrouselButtons();
}

inicializar();