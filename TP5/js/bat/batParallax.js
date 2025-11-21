/*
 * ============================================================
 * JUEGO DE VUELO DEL VAMPIRO
 * ============================================================
 * Este archivo controla el movimiento del vampiro que vuela
 * usando física simple (gravedad + saltos)
 * 
 * Presiona ESPACIO o haz CLIC para que el vampiro vuele hacia arriba
 */

// ============================================================
// PASO 1: CONFIGURACIÓN DEL JUEGO
// ============================================================
// Aquí guardamos todos los números importantes del juego

const GRAVEDAD = 0.2;              // Qué tan rápido cae el vampiro (más alto = cae más rápido)
const FUERZA_DE_SALTO = -6;        // Qué tan fuerte salta hacia arriba (negativo porque sube)
const VELOCIDAD_MAXIMA_CAIDA = 10; // Límite de qué tan rápido puede caer
const VELOCIDAD_MAXIMA_SUBIDA = -10; // Límite de qué tan rápido puede subir

const TOPE_SUPERIOR = 0;           // Borde superior de la pantalla
const TOPE_INFERIOR = 590;         // Borde inferior de la pantalla

// Configuración de proyectiles
const VELOCIDAD_PROYECTIL = 4;     // Qué tan rápido se mueven los proyectiles
const INTERVALO_SPAWN = 2000;      // Cada cuánto aparece un proyectil (milisegundos)

// Configuración de tubos (pipes)
const VELOCIDAD_TUBO = 3;          // Qué tan rápido se mueven los tubos
const ANCHO_TUBO = 60;             // Ancho de los tubos en píxeles
const ESPACIO_ENTRE_TUBOS = 200;   // Espacio vertical entre tubo superior e inferior
const INTERVALO_TUBOS = 2500;      // Cada cuánto aparece un par de tubos (milisegundos)

// Configuración de tiempo
const TIEMPO_LIMITE = 60;         // Tiempo límite del juego en segundos

// ============================================================
// PASO 2: VARIABLES DEL JUEGO
// ============================================================
// Guardamos la información que cambia mientras jugamos

let posicionVertical = 300;   // Dónde está el vampiro en el eje Y (altura)
let velocidad = 0;            // Qué tan rápido se mueve (positivo = baja, negativo = sube)
let juegoActivo = true;       // Si el juego está corriendo o pausado

let proyectiles = [];         // Lista de todos los proyectiles en pantalla
let temporizadorProyectiles = null; // Para controlar cuándo aparecen proyectiles

let tubos = [];               // Lista de todos los tubos en pantalla
let temporizadorTubos = null; // Para controlar cuándo aparecen tubos
let juegoIniciado = false;    // Si el juego ha sido iniciado con el botón

// Variables de tiempo y puntaje
let tiempoRestante = TIEMPO_LIMITE; // Tiempo restante en segundos
let temporizadorCuentaRegresiva = null; // Intervalo de la cuenta regresiva
let puntaje = 0;               // Cantidad de tubos pasados exitosamente

// ============================================================
// PASO 3: OBTENER ELEMENTOS HTML
// ============================================================
// Conectamos con los elementos que están en el HTML

const vampiro = document.getElementById('vampire');
const contenedorProyectiles = document.getElementById('projectiles-container');
const contenedorTubos = document.getElementById('pipes-container');
const explosion = document.getElementById('explosion');

// ============================================================
// PASO 4: CONFIGURAR CONTROLES
// ============================================================
// Hacer que el vampiro salte cuando presionas teclas o haces clic

// Función de cuenta regresiva
function iniciarCuentaRegresiva() {
    actualizarDisplay();
    
    temporizadorCuentaRegresiva = setInterval(() => {
        tiempoRestante--;
        actualizarDisplay();
        
        // Si el tiempo se acaba, terminar el juego
        if (tiempoRestante <= 0) {
            gameOver();
        }
    }, 1000);
}

// Actualizar displays del timer y puntaje
function actualizarDisplay() {
    const timerDisplay = document.getElementById("timer-display");
    const scoreDisplay = document.getElementById("score-display");
    
    if (timerDisplay) {
        timerDisplay.textContent = tiempoRestante;
    }
    if (scoreDisplay) {
        scoreDisplay.textContent = puntaje;
    }
}

// BOTÓN "COMENZAR A JUGAR"
const startBtnBat = document.getElementById("start-btn-bat");

if (startBtnBat) {
    startBtnBat.addEventListener("click", () => {
        juegoIniciado = true;
        juegoActivo = true;
        
        // Ocultar el overlay
        const overlay = document.getElementById("start-overlay");
        if (overlay) {
            overlay.classList.remove("active");
            overlay.classList.add("hidden");
        }
        
        // Mostrar estadísticas
        const gameStats = document.getElementById("game-stats");
        if (gameStats) {
            gameStats.classList.remove("hidden");
        }
        
        // Iniciar la cuenta regresiva
        iniciarCuentaRegresiva();
        
        // Iniciar el bucle principal y los temporizadores
        buclePrincipal();
        temporizadorTubos = setInterval(crearTubos, INTERVALO_TUBOS);
    });
}

// BOTÓN "JUGAR DE NUEVO"
const restartBtnBat = document.getElementById("restart-btn-bat");

if (restartBtnBat) {
    restartBtnBat.addEventListener("click", () => {
        reiniciarJuego();
    });
}

// Cuando presionas la barra espaciadora
document.addEventListener('keydown', function(evento) {
    const teclaBarra = evento.code === 'Space';
    
    if (teclaBarra && juegoIniciado && juegoActivo) {
        evento.preventDefault(); // Evitar que la página se desplace
        hacerSaltar();
    }
});

// Cuando haces clic en cualquier parte
document.addEventListener('click', function(evento) {
    // Solo saltar si el juego ya inició y no es el botón de inicio
    if (juegoIniciado && juegoActivo && !evento.target.id.includes('start-btn')) {
        hacerSaltar();
    }
});

// ============================================================
// PASO 5: FUNCIÓN PARA SALTAR
// ============================================================
// Hace que el vampiro suba cuando se llama

function hacerSaltar() {
    // Aplicar fuerza hacia arriba
    velocidad = FUERZA_DE_SALTO;
    
    // Cambiar la animación visual (inclinarlo hacia arriba)
    vampiro.classList.remove('vampire-falling');
    vampiro.classList.add('vampire-rising');
    
    // Después de 200 milisegundos, quitar la inclinación
    setTimeout(function() {
        vampiro.classList.remove('vampire-rising');
    }, 200);
}

// ============================================================
// PASO 6: ACTUALIZAR EL VAMPIRO
// ============================================================
// Esta función se ejecuta muchas veces por segundo

function actualizarVampiro() {
    // --- 6.1: Aplicar Gravedad ---
    // La gravedad hace que el vampiro caiga constantemente
    velocidad = velocidad + GRAVEDAD;
    
    // --- 6.2: Limitar la Velocidad ---
    // No dejar que caiga o suba demasiado rápido
    if (velocidad > VELOCIDAD_MAXIMA_CAIDA) {
        velocidad = VELOCIDAD_MAXIMA_CAIDA;
    }
    if (velocidad < VELOCIDAD_MAXIMA_SUBIDA) {
        velocidad = VELOCIDAD_MAXIMA_SUBIDA;
    }
    
    // --- 6.3: Mover al Vampiro ---
    // Cambiar su posición según la velocidad
    posicionVertical = posicionVertical + velocidad;
    
    // --- 6.4: Animación Visual ---
    // Si está cayendo rápido, inclinarlo hacia abajo
    const estaCayendo = velocidad > 2;
    const estaSubiendo = velocidad < -2;
    
    if (estaCayendo) {
        vampiro.classList.add('vampire-falling');
        vampiro.classList.remove('vampire-rising');
    } else if (estaSubiendo) {
        vampiro.classList.remove('vampire-falling');
    }
    
    // --- 6.5: Evitar que Salga de la Pantalla ---
    // Si toca el techo
    if (posicionVertical < TOPE_SUPERIOR) {
        posicionVertical = TOPE_SUPERIOR;
        velocidad = 0; // Detener el movimiento
    }
    
    // Si toca el suelo
    if (posicionVertical > TOPE_INFERIOR) {
        posicionVertical = TOPE_INFERIOR;
        velocidad = 0; // Detener el movimiento
        vampiro.classList.remove('vampire-falling');
    }
    
    // --- 6.6: Aplicar la Nueva Posición al HTML ---
    vampiro.style.top = posicionVertical + 'px';
}


// ============================================================
// PASO 7: FUNCIONES DE TUBOS (PIPES)
// ============================================================

// Crear un par de tubos (superior e inferior) con un espacio en el medio
function crearTubos() {
    // Calculamos una altura aleatoria para el espacio entre los tubos
    // El espacio debe estar entre el tope superior + margen y el tope inferior - margen
    const margenSeguridad = 100;
    const alturaMinima = TOPE_SUPERIOR + margenSeguridad;
    const alturaMaxima = TOPE_INFERIOR - ESPACIO_ENTRE_TUBOS - margenSeguridad;
    
    // Posición Y del borde inferior del tubo superior
    const alturaEspacio = Math.random() * (alturaMaxima - alturaMinima) + alturaMinima;
    
    // --- CREAR TUBO SUPERIOR ---
    const tuboSuperior = document.createElement('div');
    tuboSuperior.className = 'pipe pipe-top';
    tuboSuperior.style.left = '890px';
    tuboSuperior.style.height = alturaEspacio + 'px';
    contenedorTubos.appendChild(tuboSuperior);
    
    // --- CREAR TUBO INFERIOR ---
    const tuboInferior = document.createElement('div');
    tuboInferior.className = 'pipe pipe-bottom';
    tuboInferior.style.left = '890px';
    const alturaTuboInferior = TOPE_INFERIOR + 100 - (alturaEspacio + ESPACIO_ENTRE_TUBOS);
    tuboInferior.style.height = alturaTuboInferior + 'px';
    contenedorTubos.appendChild(tuboInferior);
    
    // Guardamos ambos tubos como un par en nuestra lista
    tubos.push({
        elementoSuperior: tuboSuperior,
        elementoInferior: tuboInferior,
        posicionX: 890,
        alturaEspacio: alturaEspacio,
        alturaTuboInferior: alturaEspacio + ESPACIO_ENTRE_TUBOS,
        contado: false  // Para saber si ya sumamos el punto por este tubo
    });
}

// Actualizar todos los tubos (moverlos y eliminar los que salen de pantalla)
function actualizarTubos() {
    const vampiroX = 100; // Posición horizontal del vampiro
    
    // Recorremos todos los pares de tubos
    for (let i = tubos.length - 1; i >= 0; i--) {
        const tubo = tubos[i];
        
        // Movemos los tubos hacia la izquierda
        tubo.posicionX -= VELOCIDAD_TUBO;
        tubo.elementoSuperior.style.left = tubo.posicionX + 'px';
        tubo.elementoInferior.style.left = tubo.posicionX + 'px';
        
        // Si el vampiro pasó el tubo y aún no se contó
        if (!tubo.contado && tubo.posicionX + ANCHO_TUBO < vampiroX) {
            tubo.contado = true;
            puntaje++;
            actualizarDisplay();
        }
        
        // Si los tubos salieron de la pantalla
        if (tubo.posicionX < -ANCHO_TUBO) {
            // Los eliminamos del HTML
            tubo.elementoSuperior.remove();
            tubo.elementoInferior.remove();
            // Los sacamos de nuestra lista
            tubos.splice(i, 1);
        }
    }
}

// Verificar colisiones entre el vampiro y los tubos
function verificarColisiones() {
    // Obtener la posición y tamaño del vampiro
    const vampiroX = 100; // Posición horizontal fija del vampiro
    const vampiroY = posicionVertical;
    const vampiroAncho = 75;
    const vampiroAlto = 50;
    
    // Revisar cada par de tubos
    for (let i = 0; i < tubos.length; i++) {
        const tubo = tubos[i];
        
        // Si el tubo está en la zona horizontal del vampiro
        if (tubo.posicionX < vampiroX + vampiroAncho && 
            tubo.posicionX + ANCHO_TUBO > vampiroX) {
            
            // Verificar si choca con el tubo superior
            if (vampiroY < tubo.alturaEspacio) {
                gameOver();
                return;
            }
            
            // Verificar si choca con el tubo inferior
            if (vampiroY + vampiroAlto > tubo.alturaTuboInferior) {
                gameOver();
                return;
            }
        }
    }
}

// Función de fin de juego
function gameOver() {
    juegoActivo = false;
    clearInterval(temporizadorProyectiles);
    clearInterval(temporizadorTubos);
    clearInterval(temporizadorCuentaRegresiva);
    
    // Ocultar el vampiro
    vampiro.style.display = 'none';
    
    // Mostrar explosión en la posición del vampiro
    if (explosion) {
        explosion.style.left = vampiro.style.left || '100px';
        explosion.style.top = vampiro.style.top || posicionVertical + 'px';
        explosion.classList.add('active');
        
        // Después de la animación de explosión, mostrar game over
        setTimeout(() => {
            explosion.classList.remove('active');
            
            // Actualizar resultados finales
            const finalScore = document.getElementById("final-score");
            const finalTime = document.getElementById("final-time");
            
            if (finalScore) {
                finalScore.textContent = puntaje;
            }
            if (finalTime) {
                finalTime.textContent = tiempoRestante + "s";
            }
            
            // Ocultar estadísticas
            const gameStats = document.getElementById("game-stats");
            if (gameStats) {
                gameStats.classList.add("hidden");
            }
            
            // Mostrar overlay de game over
            const gameoverOverlay = document.getElementById("gameover-overlay");
            if (gameoverOverlay) {
                gameoverOverlay.classList.remove("hidden");
            }
        }, 600); // Duración de la animación de explosión
    }
}

// Función para reiniciar el juego
function reiniciarJuego() {
    // Resetear variables del juego
    posicionVertical = 300;
    velocidad = 0;
    juegoActivo = true;
    tiempoRestante = TIEMPO_LIMITE;
    puntaje = 0;
    
    // Limpiar todos los tubos del DOM y del array
    tubos.forEach(tubo => {
        tubo.elementoSuperior.remove();
        tubo.elementoInferior.remove();
    });
    tubos = [];
    
    // Ocultar overlay de game over
    const gameoverOverlay = document.getElementById("gameover-overlay");
    if (gameoverOverlay) {
        gameoverOverlay.classList.add("hidden");
    }
    
    // Mostrar estadísticas
    const gameStats = document.getElementById("game-stats");
    if (gameStats) {
        gameStats.classList.remove("hidden");
    }
    
    // Reiniciar el vampiro en su posición inicial
    vampiro.style.display = 'block';
    vampiro.style.top = posicionVertical + 'px';
    vampiro.classList.remove('vampire-falling', 'vampire-rising');
    
    // Ocultar explosión si estaba visible
    if (explosion) {
        explosion.classList.remove('active');
    }
    
    // Actualizar displays
    actualizarDisplay();
    
    // Reiniciar la cuenta regresiva
    iniciarCuentaRegresiva();
    
    // Reiniciar el bucle principal y los temporizadores
    buclePrincipal();
    temporizadorTubos = setInterval(crearTubos, INTERVALO_TUBOS);
}

// ============================================================
// PASO 8: BUCLE PRINCIPAL DEL JUEGO
// ============================================================
// Este bucle se repite constantemente (60 veces por segundo aprox)

function buclePrincipal() {
    // Solo ejecutar si el juego está activo
    if (!juegoActivo) {
        return;
    }
    
    // Actualizar el vampiro
    actualizarVampiro();
    
    // Actualizar todos los tubos
    actualizarTubos();
    
    // Verificar colisiones
    verificarColisiones();
    
    // Volver a ejecutar este bucle en el próximo frame
    requestAnimationFrame(buclePrincipal);
}

// ============================================================
// PASO 9: INICIAR EL JUEGO
// ============================================================
// El juego se iniciará cuando se presione el botón "Comenzar a Jugar"
// No iniciamos automáticamente, esperamos el click del usuario
