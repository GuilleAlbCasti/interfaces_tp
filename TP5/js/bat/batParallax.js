/*
 * ============================================================
 * JUEGO DE VUELO DEL VAMPIRO
 * ============================================================
 * Este archivo controla el movimiento del vampiro que vuela
 * usando física simple (gravedad + saltos)
 * 
 * CONTROLES:
 * - Presiona ESPACIO o haz CLIC para que el vampiro vuele hacia arriba
 * 
 * MECÁNICAS DEL JUEGO:
 * 1. TUBOS: Aparecen cada 3 segundos, el vampiro debe pasar por el espacio
 * 2. HONGOS BONUS: Aparecen con 30% de probabilidad sobre los tubos
 *    - Emergen desde detrás del tubo con una animación de 2 segundos
 *    - Otorgan +10 puntos al ser atrapados
 * 3. SISTEMA DE VIDAS: 3 vidas iniciales, +1 vida cada 50 puntos
 * 4. TIEMPO LÍMITE: 120 segundos (2 minutos)
 * 
 * POSICIONAMIENTO DE HONGOS:
 * - Centrados horizontalmente en el tubo inferior
 * - 60px por encima del borde superior del tubo inferior
 * - Comienzan detrás del tubo (z-index: 80) y emergen al frente (z-index: 100)
 */

// ============================================================
// PASO 1: CONFIGURACIÓN DEL JUEGO
// ============================================================


const GRAVEDAD = 0.2;              // Qué tan rápido cae el vampiro (más alto = cae más rápido)
const FUERZA_DE_SALTO = -6;        // Qué tan fuerte salta hacia arriba (negativo porque sube)
const VELOCIDAD_MAXIMA_CAIDA = 10; // Límite de qué tan rápido puede caer
const VELOCIDAD_MAXIMA_SUBIDA = -10; // Límite de qué tan rápido puede subir

const TOPE_SUPERIOR = 0;           // Borde superior de la pantalla
const TOPE_INFERIOR = 590;         // Borde inferior de la pantalla


// Configuración de tubos (pipes)
const VELOCIDAD_TUBO = 3;          // Qué tan rápido se mueven los tubos
const ANCHO_TUBO = 60;             // Ancho de los tubos en píxeles
const ESPACIO_ENTRE_TUBOS = 200;   // Espacio vertical entre tubo superior e inferior
const INTERVALO_TUBOS = 2000;      // Cada cuánto aparece un par de tubos (milisegundos)

// Configuración de tiempo
const TIEMPO_LIMITE = 60;         // Tiempo límite del juego en segundos

// ============================================================
// PASO 2: VARIABLES DEL JUEGO
// ============================================================


let posicionVertical = 300;   // Dónde está el vampiro en el eje Y (altura)
let velocidad = 0;            // Qué tan rápido se mueve (positivo = baja, negativo = sube)
let juegoActivo = true;       // Si el juego está corriendo o pausado

let tubos = [];               // Lista de todos los tubos en pantalla
let temporizadorTubos = null; // Para controlar cuándo aparecen tubos
let juegoIniciado = false;    // Si el juego ha sido iniciado con el botón

// Variables de hongos bonus
let hongos = [];              // Lista de todos los hongos bonus en pantalla
const PROBABILIDAD_HONGO = 0.3; // 30% de chance de que aparezca un hongo con cada tubo
const PUNTOS_POR_HONGO = 10;    // Puntos que otorga atrapar un hongo

// Variables de tiempo y puntaje
let tiempoRestante = TIEMPO_LIMITE; // Tiempo restante en segundos
let temporizadorCuentaRegresiva = null; // Intervalo de la cuenta regresiva
let puntaje = 0;               // Cantidad de tubos pasados en la ronda actual
let puntajeTotal = 0;          // Puntos totales acumulados en todas las rondas

// Variables del sistema de vidas
let vidas = 3;                 // Cantidad de vidas del jugador
let ultimoPuntajeVidaExtra = 0; // Último puntaje en el que se dio vida extra
const PUNTOS_PARA_VIDA_EXTRA = 100; // Cada 100 puntos se otorga una vida extra
let inmune = false;            // Bandera de inmunidad temporal después de colisión
const DURACION_INMUNIDAD_COLISION = 2000; // 2 segundos de inmunidad después de colisión entre vidas

// Variables del sistema de inmunidad por puntos
const PUNTOS_PARA_INMUNIDAD = 50;  // Cada 50 puntos se activa inmunidad (rangos: 50-99, 100-149, 150-199, etc.)
const DURACION_INMUNIDAD = 10;      // Duración de inmunidad en segundos
let inmunePorPuntos = false;        // Flag de inmunidad activa por puntos
let tiempoInmunidad = 0;            // Tiempo restante de inmunidad
let temporizadorInmunidad = null;   // Intervalo del contador de inmunidad
let ultimoPuntajeInmunidad = 0;     // Último puntaje en el que se dio inmunidad

// ============================================================
// PASO 3: OBTENER ELEMENTOS HTML
// ============================================================
// Conectamos con los elementos que están en el HTML

const vampiro = document.getElementById('vampire');
const contenedorTubos = document.getElementById('pipes-container');
const contenedorHongos = document.getElementById('mushrooms-container');
const notificacionPuntos = document.getElementById('points-notification');
const displayInmunidad = document.getElementById('immunity-display');
const explosion = document.getElementById('explosion');
const explosionCtx = explosion ? explosion.getContext('2d') : null;

// ============================================================
// PASO 3.5: SISTEMA DE EXPLOSIÓN CON CANVAS
// ============================================================

let particulas = [];
let explosionActiva = false;

class Particula {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velocidadX = (Math.random() - 0.5) * 8;
        this.velocidadY = (Math.random() - 0.5) * 8;
        this.vida = 1.0;
        this.tamano = Math.random() * 4 + 2;
        this.color = this.generarColor();
    }
    
    generarColor() {
        const colores = [
            { r: 255, g: 100, b: 0 },   // Naranja
            { r: 255, g: 200, b: 0 },   // Amarillo
            { r: 255, g: 50, b: 0 },    // Rojo-naranja
            { r: 255, g: 255, b: 100 }  // Amarillo claro
        ];
        return colores[Math.floor(Math.random() * colores.length)];
    }
    
    actualizar() {
        this.x += this.velocidadX;
        this.y += this.velocidadY;
        this.velocidadX *= 0.95;
        this.velocidadY *= 0.95;
        this.vida -= 0.02;
        this.tamano *= 0.96;
    }
    
    dibujar(ctx) {
        ctx.save();
        ctx.globalAlpha = this.vida;
        
        // Gradiente radial para cada partícula
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.tamano);
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 1)`);
        gradient.addColorStop(0.5, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.5)`);
        gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.tamano, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function crearExplosion(x, y) {
    if (!explosionCtx) return;
    
    explosionActiva = true;
    particulas = [];
    
    // Crear 30 partículas desde el centro
    for (let i = 0; i < 30; i++) {
        particulas.push(new Particula(x, y));
    }
    
    // Mostrar canvas
    explosion.classList.add('active');
    
    // Animar explosión
    animarExplosion();
}

function animarExplosion() {
    if (!explosionActiva || !explosionCtx) return;
    
    // Limpiar canvas
    explosionCtx.clearRect(0, 0, 75, 75);
    
    // Actualizar y dibujar partículas
    for (let i = particulas.length - 1; i >= 0; i--) {
        particulas[i].actualizar();
        particulas[i].dibujar(explosionCtx);
        
        // Eliminar partículas muertas
        if (particulas[i].vida <= 0) {
            particulas.splice(i, 1);
        }
    }
    
    // Continuar animación si quedan partículas
    if (particulas.length > 0) {
        requestAnimationFrame(animarExplosion);
    } else {
        explosionActiva = false;
        explosion.classList.remove('active');
    }
}

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

// Actualizar displays del timer, puntaje y vidas
function actualizarDisplay() {
    const timerDisplay = document.getElementById("timer-display");
    const scoreDisplay = document.getElementById("score-display");
    const livesDisplay = document.getElementById("lives-display");
    
    if (timerDisplay) {
        timerDisplay.textContent = tiempoRestante;
    }
    if (scoreDisplay) {
        // Mostrar puntos totales acumulados + puntos de la ronda actual
        scoreDisplay.textContent = puntajeTotal + puntaje;
    }
    if (livesDisplay) {
        livesDisplay.textContent = vidas;
    }
}

/**
 * Muestra un overlay temporal con el estado del juego después de una colisión
 */
function mostrarEstadoTemporal() {
    // Pausar el juego brevemente
    juegoEnCurso = false;
    
    // Crear overlay temporal
    const estadoOverlay = document.createElement('div');
    estadoOverlay.className = 'estado-temporal';
    estadoOverlay.innerHTML = `
        <div class="estado-content">
            <h2>¡Vida Perdida!</h2>
            <p>Vidas Restantes: <span class="highlight">${vidas}</span></p>
            <p>Puntos Totales: <span class="highlight">${puntajeTotal}</span></p>
            <p>Tiempo Restante: <span class="highlight">${tiempoRestante}s</span></p>
            <p class="continue-msg">Continuando en unos momentos...</p>
        </div>
    `;
    document.body.appendChild(estadoOverlay);

    // Remover overlay y continuar después de 2 segundos
    setTimeout(() => {
        estadoOverlay.remove();
        juegoEnCurso = true;
    }, 2000);
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
    const margenSeguridad = 100; //Crea un "colchón" de 100 píxeles arriba y abajo para garantizar que el hueco no toque los bordes superior e inferior
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
    
    // --- CREAR HONGO BONUS (30% DE PROBABILIDAD) ---
    // Generamos un número aleatorio entre 0 y 1
    const numeroAleatorio = Math.random();
    
    // Si el número es menor a 0.3 (30% de probabilidad), creamos un hongo
    if (numeroAleatorio < PROBABILIDAD_HONGO) {
        crearHongo(890, alturaEspacio);
    }
}

// ============================================================
// PASO 8: FUNCIONES DE HONGOS BONUS
// ============================================================

/**
 * Crea un hongo bonus que aparece sobre el tubo inferior
 * @param {number} posicionX - Posición horizontal inicial del hongo (donde está el tubo)
 * @param {number} alturaEspacio - Altura donde termina el tubo superior (inicio del espacio)
 */
function crearHongo(posicionX, alturaEspacio) {
    // Verificar que existe el contenedor de hongos
    if (!contenedorHongos) {
        console.error('No se encontró el contenedor de hongos');
        return;
    }
    
    // --- PASO 1: CREAR EL ELEMENTO HTML DEL HONGO ---
    const hongo = document.createElement('div');
    hongo.className = 'mushroom';
    
    // --- PASO 2: CALCULAR LA POSICIÓN HORIZONTAL ---
    // El hongo debe estar centrado en el tubo
    // Tubo: 60px de ancho, Hongo: 40px de ancho
    // Para centrar: (60 - 40) / 2 = 10px de offset
    const offsetCentrado = (ANCHO_TUBO - 40) / 2;
    const posicionXCentrada = posicionX + offsetCentrado;
    
    // --- PASO 3: CALCULAR LA POSICIÓN VERTICAL ---
    // El hongo debe aparecer justo arriba del tubo inferior
    // alturaEspacio + ESPACIO_ENTRE_TUBOS = donde empieza el tubo inferior
    // Le restamos 60px para que aparezca encima del tubo
    const posicionYHongo = alturaEspacio + ESPACIO_ENTRE_TUBOS - 60;
    
    // --- PASO 4: APLICAR LAS POSICIONES AL ELEMENTO ---
    hongo.style.left = posicionXCentrada + 'px';
    hongo.style.top = posicionYHongo + 'px';
    hongo.style.transform = 'translateY(40px)';
    hongo.style.opacity = '0';
    
    // --- PASO 5: AGREGAR EL HONGO AL DOM ---
    contenedorHongos.appendChild(hongo);
    console.log('Hongo creado en:', posicionXCentrada, posicionYHongo);
    
    // --- PASO 6: INICIAR LA ANIMACIÓN DE EMERGENCIA ---
    // Pequeño delay para que el CSS pueda aplicar la posición inicial
    setTimeout(() => {
        hongo.classList.add('emerging');
        console.log('Animación de hongo iniciada');
    }, 50);
    
    // --- PASO 7: GUARDAR EL HONGO EN NUESTRO ARRAY ---
    hongos.push({
        elemento: hongo,           // Referencia al elemento HTML
        posicionX: posicionX,      // Posición X inicial (igual al tubo)
        posicionY: posicionYHongo  // Posición Y calculada
    });
}

/**
 * Actualiza la posición de todos los hongos (los mueve junto con los tubos)
 */
function actualizarHongos() {
    // Recorremos el array de hongos de atrás hacia adelante
    // (así podemos eliminar elementos sin problemas)
    for (let i = hongos.length - 1; i >= 0; i--) {
        const hongo = hongos[i];
        
        // --- MOVER EL HONGO A LA IZQUIERDA ---
        // Los hongos se mueven a la misma velocidad que los tubos
        hongo.posicionX -= VELOCIDAD_TUBO;
        
        // Recalcular la posición X centrada
        const offsetCentrado = (ANCHO_TUBO - 40) / 2;
        const posicionXCentrada = hongo.posicionX + offsetCentrado;
        
        // Actualizar la posición en el HTML
        hongo.elemento.style.left = posicionXCentrada + 'px';
        
        // --- ELIMINAR HONGOS QUE SALIERON DE PANTALLA ---
        // Si el hongo salió completamente por la izquierda
        if (hongo.posicionX < -40) {
            // Eliminar del DOM
            hongo.elemento.remove();
            // Eliminar del array
            hongos.splice(i, 1);
        }
    }
}

/**
 * Verifica si el vampiro colisionó con algún hongo
 */
function verificarColisionHongo() {
    // --- PASO 1: OBTENER LAS DIMENSIONES DEL VAMPIRO ---
    const vampiroX = 100;              // Posición horizontal fija
    const vampiroY = posicionVertical; // Posición vertical actual
    const vampiroAncho = 75;           // Ancho del vampiro
    const vampiroAlto = 50;            // Alto del vampiro
    
    // --- PASO 2: REVISAR CADA HONGO ---
    for (let i = hongos.length - 1; i >= 0; i--) {
        const hongo = hongos[i];
        const hongoAncho = 40;  // Ancho del hongo
        const hongoAlto = 40;   // Alto del hongo
        
        // --- PASO 3: DETECTAR COLISIÓN (HITBOX RECTANGULAR) ---
        // Verificamos si los rectángulos se superponen
        const colisionHorizontal = vampiroX < hongo.posicionX + hongoAncho && 
                                  vampiroX + vampiroAncho > hongo.posicionX;
        
        const colisionVertical = vampiroY < hongo.posicionY + hongoAlto && 
                                vampiroY + vampiroAlto > hongo.posicionY;
        
        // Si hay colisión en ambos ejes, el vampiro atrapó el hongo
        if (colisionHorizontal && colisionVertical) {
            // --- PASO 4: DAR PUNTOS AL JUGADOR ---
            const puntajeAnterior = puntaje;
            puntaje += PUNTOS_POR_HONGO;
            
            console.log('HONGO ATRAPADO! Puntos:', puntajeAnterior, '->', puntaje);
            
            actualizarDisplay();
            
            // Calcular el puntaje total actual (acumulado + ronda actual)
            const puntajeTotalAnterior = puntajeTotal + puntajeAnterior;
            const puntajeTotalActual = puntajeTotal + puntaje;
            
            // Verificar si cruzamos un múltiplo de 100 para vida extra
            const multiploVidaAnterior = Math.floor(puntajeTotalAnterior / PUNTOS_PARA_VIDA_EXTRA);
            const multiploVidaActual = Math.floor(puntajeTotalActual / PUNTOS_PARA_VIDA_EXTRA);
            
            // Si cruzamos a un nuevo múltiplo de 100
            if (multiploVidaActual > multiploVidaAnterior && multiploVidaActual > 0) {
                vidas++;
                ultimoPuntajeVidaExtra = multiploVidaActual * PUNTOS_PARA_VIDA_EXTRA;
                actualizarDisplay();
                console.log('¡VIDA EXTRA por hongo! Total vidas:', vidas, '| Puntos totales:', puntajeTotalActual, '| Múltiplo:', multiploVidaActual * PUNTOS_PARA_VIDA_EXTRA);
                
                // Mostrar notificación de vida extra
                mostrarNotificacionVidaExtra();
            }
            
            // Verificar si cruzamos un múltiplo de 50 para activar inmunidad
            const multiploInmunidadAnterior = Math.floor(puntajeTotalAnterior / PUNTOS_PARA_INMUNIDAD);
            const multiploInmunidadActual = Math.floor(puntajeTotalActual / PUNTOS_PARA_INMUNIDAD);
            
            console.log('Verificación Inmunidad tras hongo:', {
                puntajeTotalAnterior,
                puntajeTotalActual,
                multiploInmunidadAnterior,
                multiploInmunidadActual,
                ultimoPuntajeInmunidad,
                deberiaCruzar: multiploInmunidadActual > multiploInmunidadAnterior && multiploInmunidadActual > 0
            });
            
            // Si cruzamos a un nuevo múltiplo de 50 (50, 100, 150, ...)
            if (multiploInmunidadActual > multiploInmunidadAnterior && multiploInmunidadActual > 0) {
                const multiploAlcanzado = multiploInmunidadActual * PUNTOS_PARA_INMUNIDAD;
                console.log('✓✓✓ ACTIVANDO INMUNIDAD por hongo - Múltiplo:', multiploAlcanzado, 'Puntos totales:', puntajeTotalActual);
                activarInmunidad(multiploAlcanzado);
            }
            
            // --- PASO 5: MOSTRAR NOTIFICACIÓN DE PUNTOS ---
            mostrarNotificacionPuntos(hongo.posicionX, hongo.posicionY);
            
            // --- PASO 6: ELIMINAR EL HONGO ---
            hongo.elemento.remove();  // Quitar del DOM
            hongos.splice(i, 1);      // Quitar del array
        }
    }
}

/**
 * Muestra una notificación cuando se gana una vida extra
 */
function mostrarNotificacionVidaExtra() {
    const displayVidaExtra = document.getElementById('vida-extra-display');
    
    if (displayVidaExtra) {
        // Mostrar el display
        displayVidaExtra.classList.remove('hidden');
        displayVidaExtra.classList.add('active');
        
        console.log('Display de vida extra mostrado');
        
        // Ocultar después de 2 segundos
        setTimeout(() => {
            displayVidaExtra.classList.remove('active');
            displayVidaExtra.classList.add('hidden');
        }, 2000);
    } else {
        console.error('displayVidaExtra no encontrado!');
    }
}

/**
 * Muestra una notificación visual cuando se atrapa un hongo
 * @param {number} x - Posición X donde mostrar la notificación
 * @param {number} y - Posición Y donde mostrar la notificación
 */
function mostrarNotificacionPuntos(x, y) {
    if (!notificacionPuntos) return;
    
    // Posicionar la notificación donde estaba el hongo
    notificacionPuntos.style.left = x + 'px';
    notificacionPuntos.style.top = y + 'px';
    
    // Mostrar la notificación
    notificacionPuntos.style.display = 'block';
    notificacionPuntos.classList.add('show');
    
    // Ocultar después de 1 segundo
    setTimeout(() => {
        notificacionPuntos.style.display = 'none';
        notificacionPuntos.classList.remove('show');
    }, 1000);
}

/**
 * Activa el modo de inmunidad por 10 segundos
 * Permite al vampiro pasar por tubos sin colisionar
 */
function activarInmunidad(puntajeTotalActual) {
    console.log('activarInmunidad() llamada - puntaje total actual:', puntajeTotalActual);
    
    // Marcar que se dio inmunidad en este puntaje total
    ultimoPuntajeInmunidad = puntajeTotalActual;
    
    // Activar flag de inmunidad
    inmunePorPuntos = true;
    tiempoInmunidad = DURACION_INMUNIDAD;
    
    console.log('Estado inmunidad:', {inmunePorPuntos, tiempoInmunidad, ultimoPuntajeInmunidad, displayInmunidad: !!displayInmunidad});
    
    // Mostrar el display de inmunidad
    if (displayInmunidad) {
        displayInmunidad.classList.remove('hidden');
        displayInmunidad.classList.add('active');
        actualizarDisplayInmunidad();
        console.log('Display de inmunidad mostrado');
    } else {
        console.error('displayInmunidad no encontrado!');
    }
    
    // Agregar efecto visual al vampiro
    if (vampiro) {
        vampiro.classList.add('immune');
    }
    
    // Iniciar contador regresivo de inmunidad
    if (temporizadorInmunidad) {
        clearInterval(temporizadorInmunidad);
    }
    
    temporizadorInmunidad = setInterval(() => {
        tiempoInmunidad--;
        actualizarDisplayInmunidad();
        
        // Si el tiempo de inmunidad se acabó
        if (tiempoInmunidad <= 0) {
            desactivarInmunidad();
        }
    }, 1000);
}

/**
 * Desactiva el modo de inmunidad
 */
function desactivarInmunidad() {
    inmunePorPuntos = false;
    tiempoInmunidad = 0;
    
    // Ocultar el display
    if (displayInmunidad) {
        displayInmunidad.classList.remove('active');
        displayInmunidad.classList.add('hidden');
    }
    
    // Quitar efecto visual del vampiro
    if (vampiro) {
        vampiro.classList.remove('immune');
    }
    
    // Detener el temporizador
    if (temporizadorInmunidad) {
        clearInterval(temporizadorInmunidad);
        temporizadorInmunidad = null;
    }
}

/**
 * Actualiza el display del tiempo de inmunidad restante
 */
function actualizarDisplayInmunidad() {
    if (displayInmunidad) {
        displayInmunidad.textContent = `INMUNE: ${tiempoInmunidad}s`;
    }
}

/**
 * Función que se llama cuando el vampiro colisiona con un tubo
 * Acumula puntos, resta 1 vida, muestra estado y continúa el juego
 * Solo hace game over cuando vidas = 0
 */
function colisionConTubo() {
    // Si ya está en proceso de game over, no hacer nada
    if (!juegoActivo) {
        return;
    }
    
    // Activar inmunidad inmediatamente para evitar colisiones múltiples
    inmune = true;
    
    console.log('¡COLISIÓN CON TUBO!');
    
    // Acumular puntos de esta ronda al total
    puntajeTotal += puntaje;
    console.log('Puntos de esta ronda:', puntaje);
    console.log('Puntos totales acumulados:', puntajeTotal);
    
    // Restar una vida
    vidas--;
    console.log('Vidas restantes:', vidas);
    
    // Verificar si al acumular puntos alcanzamos un múltiplo de 50 para inmunidad
    const proximoMultiplo = Math.floor(ultimoPuntajeInmunidad / PUNTOS_PARA_INMUNIDAD) * PUNTOS_PARA_INMUNIDAD + PUNTOS_PARA_INMUNIDAD;
    
    console.log('Verificación Inmunidad en Colisión:', {
        puntajeTotal,
        ultimoPuntajeInmunidad,
        proximoMultiplo,
        alcanzado: puntajeTotal >= proximoMultiplo
    });
    
    // Si alcanzamos o superamos el próximo múltiplo de 50
    if (puntajeTotal >= proximoMultiplo && proximoMultiplo >= PUNTOS_PARA_INMUNIDAD) {
        console.log('✓✓✓ ACTIVANDO INMUNIDAD POR ACUMULACIÓN - Múltiplo:', proximoMultiplo, 'Puntos totales:', puntajeTotal);
        // Pasamos el múltiplo exacto, no el puntaje actual
        activarInmunidad(proximoMultiplo);
    }
    
    // Verificar si se acabaron las vidas
    if (vidas <= 0) {
        // Desactivar el juego inmediatamente para evitar más colisiones
        juegoActivo = false;
        
        // Game over definitivo
        gameOver();
    } else {
        // Eliminar todos los tubos que están cerca del vampiro para evitar colisiones inmediatas
        limpiarTubosCercanos();
        
        // Mostrar estado temporal y continuar
        mostrarEstadoTemporal();
        
        // Resetear posición del vampiro
        posicionVertical = 300;
        velocidad = 0;
        
        // Resetear puntaje del round actual (pero mantener puntajeTotal)
        puntaje = 0;
        
        // Actualizar display
        actualizarDisplay();
        
        // Desactivar inmunidad después de 3 segundos
        setTimeout(() => {
            inmune = false;
            console.log('Inmunidad temporal desactivada');
        }, 3000);
    }
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
            const puntajeAnterior = puntaje;
            puntaje++;
            
            console.log('PUNTO SUMADO:', puntaje, '| Anterior:', puntajeAnterior);
            
            actualizarDisplay();
            
            // Calcular el puntaje total actual (acumulado + ronda actual)
            const puntajeTotalActual = puntajeTotal + puntaje;
            const puntajeTotalAnterior = puntajeTotal + puntajeAnterior;
            
            // Verificar si cruzamos un múltiplo de 100 para vida extra
            const multiploVidaAnterior = Math.floor(puntajeTotalAnterior / PUNTOS_PARA_VIDA_EXTRA);
            const multiploVidaActual = Math.floor(puntajeTotalActual / PUNTOS_PARA_VIDA_EXTRA);
            
            // Si cruzamos a un nuevo múltiplo de 100
            if (multiploVidaActual > multiploVidaAnterior && multiploVidaActual > 0) {
                vidas++;
                ultimoPuntajeVidaExtra = multiploVidaActual * PUNTOS_PARA_VIDA_EXTRA;
                actualizarDisplay();
                console.log('¡VIDA EXTRA! Total vidas:', vidas, '| Puntos totales:', puntajeTotalActual, '| Múltiplo:', multiploVidaActual * PUNTOS_PARA_VIDA_EXTRA);
                
                // Mostrar notificación de vida extra
                mostrarNotificacionVidaExtra();
            }
            
            // Verificar si cruzamos un múltiplo de 50 para activar inmunidad
            const multiploInmunidadAnterior = Math.floor(puntajeTotalAnterior / PUNTOS_PARA_INMUNIDAD);
            const multiploInmunidadActual = Math.floor(puntajeTotalActual / PUNTOS_PARA_INMUNIDAD);
            
            console.log('Verificación Inmunidad:', {
                puntajeTotalAnterior,
                puntajeTotalActual,
                multiploInmunidadAnterior,
                multiploInmunidadActual,
                ultimoPuntajeInmunidad,
                deberiaCruzar: multiploInmunidadActual > multiploInmunidadAnterior && multiploInmunidadActual > 0
            });
            
            // Si cruzamos a un nuevo múltiplo de 50 (50, 100, 150, ...)
            if (multiploInmunidadActual > multiploInmunidadAnterior && multiploInmunidadActual > 0) {
                const multiploAlcanzado = multiploInmunidadActual * PUNTOS_PARA_INMUNIDAD;
                console.log('✓✓✓ ACTIVANDO INMUNIDAD - Múltiplo:', multiploAlcanzado, 'Puntos totales:', puntajeTotalActual);
                activarInmunidad(multiploAlcanzado);
            }
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

/**
 * Elimina los tubos que están cerca del vampiro para evitar colisiones inmediatas después de reiniciar
 */
function limpiarTubosCercanos() {
    const vampiroX = 100;
    const rangoLimpieza = 300; // Limpiar tubos en un rango de 300px
    
    for (let i = tubos.length - 1; i >= 0; i--) {
        const tubo = tubos[i];
        
        // Si el tubo está cerca del vampiro
        if (tubo.posicionX > vampiroX - rangoLimpieza && tubo.posicionX < vampiroX + rangoLimpieza) {
            // Eliminarlo del DOM
            tubo.elementoSuperior.remove();
            tubo.elementoInferior.remove();
            // Eliminarlo del array
            tubos.splice(i, 1);
            console.log('Tubo cercano eliminado en posición:', tubo.posicionX);
        }
    }
}

// Verificar colisiones entre el vampiro y los tubos
function verificarColisiones() {
    // Si el vampiro tiene inmunidad (por puntos o por colisión reciente), no detectar colisiones
    if (inmunePorPuntos || inmune) {
        return;
    }
    
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
                colisionConTubo();
                return;
            }
            
            // Verificar si choca con el tubo inferior
            if (vampiroY + vampiroAlto > tubo.alturaTuboInferior) {
                colisionConTubo();
                return;
            }
        }
    }
}

// Función de fin de juego
function gameOver() {
    juegoActivo = false;
    clearInterval(temporizadorTubos);
    clearInterval(temporizadorCuentaRegresiva);
    
    // Detener inmunidad si estaba activa
    if (temporizadorInmunidad) {
        clearInterval(temporizadorInmunidad);
    }
    
    // Ocultar el vampiro
    vampiro.style.display = 'none';
    
    // Mostrar explosión en la posición del vampiro
    if (explosion) {
        explosion.style.left = vampiro.style.left || '100px';
        explosion.style.top = vampiro.style.top || posicionVertical + 'px';
        
        // Crear explosión con partículas en el centro del canvas (37.5, 37.5)
        crearExplosion(37.5, 37.5);
        
        // Después de la animación de explosión, mostrar game over
        setTimeout(() => {
            
            // Actualizar resultados finales
            const finalScore = document.getElementById("final-score");
            const finalLives = document.getElementById("final-lives");
            const finalTime = document.getElementById("final-time");
            
            if (finalScore) {
                // Mostrar puntos totales acumulados (ya incluye los puntos de la última ronda)
                finalScore.textContent = puntajeTotal;
            }
            if (finalLives) {
                finalLives.textContent = vidas;
            }
            if (finalTime) {
                finalTime.textContent = tiempoRestante + " s";
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
    // Si quedan vidas, es un reinicio de ronda (mantener puntos totales y vidas)
    // Si no quedan vidas, es un reinicio completo
    const esReinicioCompleto = vidas <= 0;
    
    if (esReinicioCompleto) {
        console.log('Reinicio completo - Sin vidas');
        vidas = 3;
        puntajeTotal = 0;
        ultimoPuntajeVidaExtra = 0;
    } else {
        console.log('Reinicio de ronda - Vidas:', vidas, 'Puntos totales:', puntajeTotal);
    }
    
    // Resetear variables de la ronda actual
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
    
    // Limpiar todos los hongos del DOM y del array
    hongos.forEach(hongo => {
        hongo.elemento.remove();
    });
    hongos = [];
    
    // Resetear bandera de inmunidad temporal
    inmune = false;
    
    // Resetear sistema de inmunidad por puntos
    inmunePorPuntos = false;
    tiempoInmunidad = 0;
    ultimoPuntajeInmunidad = 0;
    if (temporizadorInmunidad) {
        clearInterval(temporizadorInmunidad);
        temporizadorInmunidad = null;
    }
    
    // Ocultar display de inmunidad y quitar efecto visual
    if (displayInmunidad) {
        displayInmunidad.classList.remove('active');
        displayInmunidad.classList.add('hidden');
    }
    if (vampiro) {
        vampiro.classList.remove('immune');
    }
    
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
    
    // Actualizar todos los hongos bonus
    actualizarHongos();
    
    // Verificar colisiones con tubos
    verificarColisiones();
    
    // Verificar colisiones con hongos
    verificarColisionHongo();
    
    // Volver a ejecutar este bucle en el próximo frame
    requestAnimationFrame(buclePrincipal);
}

// ============================================================
// PASO 9: INICIAR EL JUEGO
// ============================================================
// El juego se iniciará cuando se presione el botón "Comenzar a Jugar"
// No iniciamos automáticamente, esperamos el click del usuario
