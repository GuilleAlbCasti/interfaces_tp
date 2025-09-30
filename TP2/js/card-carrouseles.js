juegos = [];

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
// Función para mostrar los juegos en el DOM
async function mostrarJuegos(juegosXcaregoria, genero) {
  const main = document.getElementById('cards');
  const tituloCategoria = document.createElement('h2');
  tituloCategoria.textContent = "Juegos de la Categoria " + genero;
  main.appendChild(tituloCategoria);

  // Crear contenedor del carrusel
  const carruselContainer = document.createElement('div');
  carruselContainer.className = 'carousel-container';

  // Botón anterior
  const btnAnterior = document.createElement('button');
  btnAnterior.className = 'carousel-nav carousel-prev';
  btnAnterior.innerHTML = '';

  // Contenedor de las cards
  const contenedorXcategoria = document.createElement('article');
  contenedorXcategoria.className = 'categoria';

  // Botón siguiente
  const btnSiguiente = document.createElement('button');
  btnSiguiente.className = 'carousel-nav carousel-next';
  btnSiguiente.innerHTML = '';

  // Agregar elementos al carrusel
  carruselContainer.appendChild(btnAnterior);
  carruselContainer.appendChild(contenedorXcategoria);
  carruselContainer.appendChild(btnSiguiente);
  main.appendChild(carruselContainer);

  juegosXcaregoria.forEach(juego => {
    const juegoDiv = crearCard(juego, 'card');
    contenedorXcategoria.appendChild(juegoDiv);
  });

  // Configurar funcionalidad del carrusel
  setupCarruselCategoria(contenedorXcategoria, btnAnterior, btnSiguiente);
}
// Función para configurar el carrusel de una categoría
function setupCarruselCategoria(contenedor, btnAnterior, btnSiguiente) {
  let currentIndex = 0;
  const cardsToShow = 6; // Número de cards visibles
  const cardWidth = 225; // Ancho de la carta + margenes

  function updateCarrusel() {
    const offset = -currentIndex * cardWidth;
    contenedor.style.transform = `translateX(${offset}px)`;
  }

  function nextSlide() {
    const totalCards = contenedor.children.length;
    const maxIndex = totalCards - cardsToShow;
    if (currentIndex < maxIndex) {
      currentIndex++;
      updateCarrusel();
    }
  }

  function prevSlide() {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarrusel();
    }
  }

  // Event listeners
  btnSiguiente.addEventListener('click', nextSlide);
  btnAnterior.addEventListener('click', prevSlide);
}
function crearCard(juego, estilo) {
  const juegoDiv = document.createElement('div');
  // Harcodeo para agregar el peg solitaire espacial
  if (juego.name === "Limbo") {
    juego.name = "Peg Solitaire Espacial";
    juego.background_image = "img/pegSolitaireEspacial.png";
    juegoDiv.className = estilo;
    juegoDiv.style.backgroundImage = `url('${juego.background_image}')`;
    juegoDiv.innerHTML = `
  <h2>${juego.name}</h2>
  ${(() => {
        let html = '<p> Generos: ';
        for (let i = 0; i < juego.genres.length; i++) {
          html += `${juego.genres[i].name} `;
        }
        return html + '</p>';
      })()}
  <p> Valoracion: ${juego.rating} / 5</p>
  <a href="juego.html" class="btn-ver-mas">Ver más</a>
  `;
  } else {
    juegoDiv.className = estilo;
    juegoDiv.style.backgroundImage = `url('${juego.background_image}')`;
    juegoDiv.innerHTML = `
  <h2>${juego.name}</h2>
  ${(() => {
        let html = '<p> Generos: ';
        for (let i = 0; i < juego.genres.length; i++) {
          html += `${juego.genres[i].name} `;
        }
        return html + '</p>';
      })()}
  <p> Valoracion: ${juego.rating} / 5</p>
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
  const temp = juegos;
  temp.sort((a, b) => b.rating - a.rating);
  return temp.slice(0, 10);
}
// Función para mostrar los juegos más valorados en el carrousel
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
  await mostrarJuegos(juegosPorGenero('Adventure'), "Adventure");
  await mostrarJuegos(juegosPorGenero('Shooter'), "Shooter");
  await mostrarJuegos(juegosPorGenero('RPG'), "RPG");
  await mostrarJuegos(juegosPorGenero('Indie'), "Indie");
  //await mostrarJuegosMasValorados();



  //await mostrarJuegosMasValorados();
}

inicializar();

