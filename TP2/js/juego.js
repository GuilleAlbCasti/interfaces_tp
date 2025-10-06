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

// Función para obtener los 10 juegos más valorados
function juegosMasValorados() {
  const temp = juegos;
  temp.sort((a, b) => b.rating - a.rating);
  return temp.slice(0, 10);
}

//funcion para crear Imagenes de juegos mas valorados
function crearImagen(juego, clase) { 
    const link = document.createElement('a');
    link.href = `#`;   
    const juegoImg = document.createElement('img');
    juegoImg.src = juego.background_image;
    juegoImg.alt = juego.name;
    juegoImg.className = clase;
    link.appendChild(juegoImg);

    return link;
}

// Función para mostrar los 10 juegos más valorados en el DOM
async function mostrarJuegosMasValorados() {
  const main = document.getElementById('lista_juegos_similares');  

  const juegosValorados = juegosMasValorados(); 

  juegosValorados.forEach(juego => {
    const juegoDiv = crearImagen(juego, 'juego-valorado');
    main.appendChild(juegoDiv);
  });
  
}

// Cargar datos y mostrar juegos al cargar la página
window.addEventListener('load', async () => {
  await cargarDatosDeJuegos();
  await mostrarJuegosMasValorados();
}); 