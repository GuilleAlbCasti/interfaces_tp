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
const INTERVALO_TUBOS_POST = 1500; // Cada cuánto aparece un par de tubos luego de los 30 segundos

// Configuración de tiempo
const TIEMPO_LIMITE = 60;         // Tiempo límite del juego en segundos
const SET_TIEMPO_RESTANTE = 30;    // Seteo (segundos restantes) en que cambia la velocidad de tubos

// ============================================================
// PASO 2: VARIABLES DEL JUEGO
// ============================================================


let posicionVertical = 300;   // Dónde está el vampiro en el eje Y (altura)
let velocidad = 0;            // Qué tan rápido se mueve (positivo = baja, negativo = sube)
let juegoActivo = true;       // Si el juego está corriendo o pausado

let tubos = [];               // Lista de todos los tubos en pantalla
let temporizadorTubos = null; // Para controlar cuándo aparecen tubos
let juegoIniciado = false;    // Si el juego ha sido iniciado con el botón
let barraEspaciadoraBloqueada = false; // Control temporal para bloquear la barra espaciadora

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
const PUNTOS_PARA_INMUNIDAD = 50;  // Cada 50 puntos se activa inmunidad 
const DURACION_INMUNIDAD = 10;      // Duración de inmunidad en segundos
let inmunePorPuntos = false;        // Flag de inmunidad activa por puntos
let tiempoInmunidad = 0;            // Tiempo restante de inmunidad
let temporizadorInmunidad = null;   // Intervalo del contador de inmunidad
let ultimoPuntajeInmunidad = 0;     // Último puntaje en el que se dio inmunidad

// Variables del sistema de velocidad de tubos
let modoRapido = false;             // Flag que indica si el juego está en modo rápido (tubos rojos)

// ============================================================
// PASO 3: OBTENER ELEMENTOS HTML
// ============================================================


const vampiro = document.getElementById('vampire');
const contenedorTubos = document.getElementById('pipes-container');
const contenedorHongos = document.getElementById('mushrooms-container');
const notificacionPuntos = document.getElementById('points-notification');
const displayInmunidad = document.getElementById('immunity-display');



// ============================================================
// PASO 4: FUNCIONES DE TIEMPO Y DISPLAY
// ============================================================


// Función de cuenta regresiva
function iniciarCuentaRegresiva() {
    actualizarDisplay();
    
    temporizadorCuentaRegresiva = setInterval(() => {
        tiempoRestante--;
        actualizarDisplay();
        
        // *** CAMBIAR VELOCIDAD DE TUBOS CUANDO LLEGA AL TIEMPO CONFIGURADO ***
        // Cuando quedan SET_TIEMPO_RESTANTE segundos (ej: 30 segundos restantes = 30 segundos jugados)
        if (tiempoRestante === SET_TIEMPO_RESTANTE) {
            // Activar modo rápido (los nuevos tubos se crearán con clase fast-mode)
            modoRapido = true;
            
            // Detener el temporizador actual de tubos
            clearInterval(temporizadorTubos);
            
            // CREAR UN TUBO INMEDIATAMENTE antes de cambiar el intervalo
            crearTubos();

            // Reiniciar con la nueva velocidad (más rápido)
            temporizadorTubos = setInterval(crearTubos, INTERVALO_TUBOS_POST);

            
        }
        
        // Si el tiempo se acaba, terminar el juego
        if (tiempoRestante <= 0) {
            gameOver();
        }
    }, 1000);
}

//Cambia el color de todos los tubos existentes agregando una clase CSS
 
function cambiarColorTubos() {
    // Recorrer todos los tubos existentes
    tubos.forEach(tubo => {
        // Agregar clase 'fast-mode' a ambos tubos del par
        tubo.elementoSuperior.classList.add('fast-mode');
        tubo.elementoInferior.classList.add('fast-mode');
    });
    
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
        </div>
    `;
    document.body.appendChild(estadoOverlay);

    // Remover overlay y continuar después de 2 segundos
    setTimeout(() => {
        estadoOverlay.remove();
        juegoEnCurso = true;
    }, 2000);
}


// ============================================================
// PASO 5: CONFIGURAR CONTROLES
// ============================================================
// Hacer que el vampiro salte cuando presionas teclas o haces clic

// BOTÓN "COMENZAR A JUGAR"
const startBtnBat = document.getElementById("start-btn-bat");

if (startBtnBat) {
    startBtnBat.addEventListener("click", () => {
        // Inicializar el canvas de explosión (debe hacerse cuando el DOM está listo)
        if (typeof inicializarExplosionCanvas === 'function') {
            inicializarExplosionCanvas();
        }
        
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
    
    // Siempre prevenir el desplazamiento si la barra está bloqueada o si el juego está activo
    if (teclaBarra && (juegoIniciado || barraEspaciadoraBloqueada)) {
        evento.preventDefault(); // Evitar que la página se desplace
        
        // Solo hacer saltar si el juego está activo y no está bloqueada
        if (juegoActivo && !barraEspaciadoraBloqueada) {
            hacerSaltar();
        }
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
// PASO 6: FUNCIÓN PARA SALTAR
// ============================================================


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
// PASO 7: ACTUALIZAR EL VAMPIRO
// ============================================================


function actualizarVampiro() {
    // --- Aplicar Gravedad ---
    // La gravedad hace que el vampiro caiga constantemente
    velocidad = velocidad + GRAVEDAD;
    
    // --- Limitar la Velocidad ---
    // No dejar que caiga o suba demasiado rápido
    if (velocidad > VELOCIDAD_MAXIMA_CAIDA) {
        velocidad = VELOCIDAD_MAXIMA_CAIDA;
    }
    if (velocidad < VELOCIDAD_MAXIMA_SUBIDA) {
        velocidad = VELOCIDAD_MAXIMA_SUBIDA;
    }
    
    // ---  Mover al Vampiro ---
    // Cambiar su posición según la velocidad
    posicionVertical = posicionVertical + velocidad;
    
    // ---  Animación Visual ---
    // Si está cayendo rápido, inclinarlo hacia abajo
    const estaCayendo = velocidad > 2;
    const estaSubiendo = velocidad < -2;
    
    if (estaCayendo) {
        vampiro.classList.add('vampire-falling');
        vampiro.classList.remove('vampire-rising');
    } else if (estaSubiendo) {
        vampiro.classList.remove('vampire-falling');
    }
    
    // --- Evitar que Salga de la Pantalla ---
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
    
    // --- Aplicar la Nueva Posición al HTML ---
    vampiro.style.top = posicionVertical + 'px';
}


// ============================================================
// PASO 8: FUNCIONES DE TUBOS (PIPES)
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
    
    // Si estamos en modo rápido, agregar la clase fast-mode inmediatamente
    if (modoRapido) {
        tuboSuperior.classList.add('fast-mode');
    }
    
    tuboSuperior.style.left = '890px';
    tuboSuperior.style.height = alturaEspacio + 'px';
    contenedorTubos.appendChild(tuboSuperior);
    
    // --- CREAR TUBO INFERIOR ---
    const tuboInferior = document.createElement('div');
    tuboInferior.className = 'pipe pipe-bottom';
    
    // Si estamos en modo rápido, agregar la clase fast-mode inmediatamente
    if (modoRapido) {
        tuboInferior.classList.add('fast-mode');
    }
    
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
    
    // --- CREAR HONGO BONUS ---
    const numeroAleatorio = Math.random();
    
    // Si el número es menor a 0.3 (30% de probabilidad), creamos un hongo
    if (numeroAleatorio < PROBABILIDAD_HONGO) {
        crearHongo(890, alturaEspacio); 
        //         ↑    ↑
        //         |    └─ Posición Y (altura vertical)
        //         └────── Posición X (890 píxeles desde la izquierda)
    }
}

// ============================================================
// PASO 9: FUNCIONES DE HONGOS BONUS
// ============================================================

/** javaDoc
 * Crea un hongo bonus que aparece sobre el tubo inferior
 * @param {number} posicionX - Posición horizontal inicial del hongo (donde está el tubo)
 * @param {number} alturaEspacio - Altura donde termina el tubo superior (inicio del espacio)
 *
 * POSICIONAMIENTO DE HONGOS:
 * - Centrados horizontalmente en el tubo inferior
 * - 60px por encima del borde superior del tubo inferior
 * - Comienzan detrás del tubo (z-index: 80) y emergen al frente (z-index: 100)
 */

function crearHongo(posicionX, alturaEspacio) {
    // Verificar que existe el contenedor de hongos
    if (!contenedorHongos) {
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
        
    // --- PASO 6: INICIAR LA ANIMACIÓN DE EMERGENCIA ---
   /* Pequeño delay para que el CSS pueda aplicar la posición inicial
            El delay permite que:
            El navegador dibuje el hongo en su estado inicial (invisible, abajo)
            Luego agregue la clase que activa la animación CSS
            El navegador pueda animar suavemente el cambio de estado
            Sin el delay: La animación no se vería porque el navegador aplicaría ambos estados al mismo tiempo.
    */
    setTimeout(() => {
        hongo.classList.add('emerging');
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
                
                // Mostrar notificación de vida extra
                mostrarNotificacionVidaExtra();
            }
            
            // Verificar si cruzamos un múltiplo de 50 para activar inmunidad
            const multiploInmunidadAnterior = Math.floor(puntajeTotalAnterior / PUNTOS_PARA_INMUNIDAD);
            const multiploInmunidadActual = Math.floor(puntajeTotalActual / PUNTOS_PARA_INMUNIDAD);
            
                    
            // Si cruzamos a un nuevo múltiplo de 50 (50, 100, 150, ...)
            if (multiploInmunidadActual > multiploInmunidadAnterior && multiploInmunidadActual > 0) {
                const multiploAlcanzado = multiploInmunidadActual * PUNTOS_PARA_INMUNIDAD;
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


// ============================================================
// PASO 10: FUNCIONES DE NOTIFICACIONES E INMUNIDAD
// ============================================================
/**
 * Muestra una notificación cuando se gana una vida extra
 */
function mostrarNotificacionVidaExtra() {
    const displayVidaExtra = document.getElementById('vida-extra-display');
    
    if (displayVidaExtra) {
        // Mostrar el display
        displayVidaExtra.classList.remove('hidden');
        displayVidaExtra.classList.add('active');
                
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
    
    // Marcar que se dio inmunidad en este puntaje total
    ultimoPuntajeInmunidad = puntajeTotalActual;
    
    // Activar flag de inmunidad
    inmunePorPuntos = true;
    tiempoInmunidad = DURACION_INMUNIDAD;
    
    // Mostrar el display de inmunidad
    if (displayInmunidad) {
        displayInmunidad.classList.remove('hidden');
        displayInmunidad.classList.add('active');
        actualizarDisplayInmunidad();
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
        
    // Acumular puntos de esta ronda al total
    puntajeTotal += puntaje;
        
    // Restar una vida
    vidas--;
    
    // Verificar si al acumular puntos alcanzamos un múltiplo de 50 para inmunidad
    const proximoMultiplo = Math.floor(ultimoPuntajeInmunidad / PUNTOS_PARA_INMUNIDAD) * PUNTOS_PARA_INMUNIDAD + PUNTOS_PARA_INMUNIDAD;
      
    // Si alcanzamos o superamos el próximo múltiplo de 50
    if (puntajeTotal >= proximoMultiplo && proximoMultiplo >= PUNTOS_PARA_INMUNIDAD) {
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
        // AÚN QUEDAN VIDAS - Mostrar explosión y continuar
        
        // 1. Mostrar explosión en la posición actual del vampiro
        const explosionElement = document.getElementById('explosion');
        if (explosionElement && typeof crearExplosion === 'function') {
            // Calcular posición centrada del canvas en el vampiro
            const vampiroLeft = 100;
            const vampiroTop = posicionVertical;
            const vampiroAncho = 75;
            const vampiroAlto = 50;
            const canvasSize = 75;
            
            const explosionLeft = vampiroLeft + (vampiroAncho / 2) - (canvasSize / 2);
            const explosionTop = vampiroTop + (vampiroAlto / 2) - (canvasSize / 2);
            
            explosionElement.style.left = explosionLeft + 'px';
            explosionElement.style.top = explosionTop + 'px';
            
            // Crear explosión
            crearExplosion(37.5, 37.5);
            
            // Ocultar vampiro temporalmente
            vampiro.style.display = 'none';
            
            // Esperar a que termine la explosión (600ms) antes de continuar
            setTimeout(() => {
                // Mostrar vampiro nuevamente
                vampiro.style.display = 'block';
                
                // Ocultar canvas de explosión
                explosionElement.classList.remove('active');
            }, 600);
        }
        
        // 2. Eliminar todos los tubos que están cerca del vampiro para evitar colisiones inmediatas
        limpiarTubosCercanos();
        
        // 3. Mostrar estado temporal y continuar
        mostrarEstadoTemporal();
        
        // 4. Resetear posición del vampiro
        posicionVertical = 300;
        velocidad = 0;
        
        // 5. Resetear puntaje del round actual (pero mantener puntajeTotal)
        puntaje = 0;
        
        // 6. Actualizar display
        actualizarDisplay();
        
        // 7. Desactivar inmunidad después de 3 segundos
        setTimeout(() => {
            inmune = false;
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
                
                // Mostrar notificación de vida extra
                mostrarNotificacionVidaExtra();
            }
            
            // Verificar si cruzamos un múltiplo de 50 para activar inmunidad
            const multiploInmunidadAnterior = Math.floor(puntajeTotalAnterior / PUNTOS_PARA_INMUNIDAD);
            const multiploInmunidadActual = Math.floor(puntajeTotalActual / PUNTOS_PARA_INMUNIDAD);
            
                    
            // Si cruzamos a un nuevo múltiplo de 50 (50, 100, 150, ...)
            if (multiploInmunidadActual > multiploInmunidadAnterior && multiploInmunidadActual > 0) {
                const multiploAlcanzado = multiploInmunidadActual * PUNTOS_PARA_INMUNIDAD;
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

// ============================================================
// PASO 11: Funciones DE FIN DE JUEGO Y REINICIO
// ============================================================

// Función de fin de juego
function gameOver() {
    juegoActivo = false;
    clearInterval(temporizadorTubos);
    clearInterval(temporizadorCuentaRegresiva);
    
    // Bloquear la barra espaciadora para evitar desplazamiento de pantalla
    barraEspaciadoraBloqueada = true;
    
    // Desbloquear después de 2 segundos
    setTimeout(() => {
        barraEspaciadoraBloqueada = false;
    }, 2000);
    
    // Detener inmunidad si estaba activa
    if (temporizadorInmunidad) {
        clearInterval(temporizadorInmunidad);
    }
    
    // Ocultar el vampiro
    vampiro.style.display = 'none';
    
    // Mostrar explosión en la posición del vampiro
    const explosionElement = document.getElementById('explosion');
    
    if (explosionElement && typeof crearExplosion === 'function') {
        // El canvas es 75x75px, el vampiro es 75x50px
        // Centrar el canvas en el centro del vampiro
        const vampiroLeft = 100; // Posición X fija del vampiro
        const vampiroTop = posicionVertical; // Posición Y actual
        const vampiroAncho = 75;
        const vampiroAlto = 50;
        const canvasSize = 75;
        
        // Calcular el centro del vampiro y restar la mitad del canvas para centrarlo
        const explosionLeft = vampiroLeft + (vampiroAncho / 2) - (canvasSize / 2);
        const explosionTop = vampiroTop + (vampiroAlto / 2) - (canvasSize / 2);
        
        explosionElement.style.left = explosionLeft + 'px';
        explosionElement.style.top = explosionTop + 'px';
        
        
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
    
    // Desbloquear barra espaciadora
    barraEspaciadoraBloqueada = false;
    
    // Resetear sistema de inmunidad por puntos
    inmunePorPuntos = false;
    tiempoInmunidad = 0;
    ultimoPuntajeInmunidad = 0;
    if (temporizadorInmunidad) {
        clearInterval(temporizadorInmunidad);
        temporizadorInmunidad = null;
    }
    
    // Resetear modo rápido (volver a tubos verdes y velocidad normal)
    modoRapido = false;
    
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
    const explosionElement = document.getElementById('explosion');
    if (explosionElement) {
        explosionElement.classList.remove('active');
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
// PASO 12: BUCLE PRINCIPAL DEL JUEGO
// ============================================================


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

