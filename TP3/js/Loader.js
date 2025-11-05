
const loadingContainer = document.getElementById("loadingContainer")
const progressBar = document.getElementById("progressBar")
const loadingPercentage = document.getElementById("loadingPercentage")
const mainContent = document.getElementById("mainContent")

// Variables de configuración
const TOTAL_DURATION = 10000 // 10 segundos en milisegundos
const UPDATE_INTERVAL = 50 // Actualizar cada 50ms (20 veces por segundo)

// Variables de control
let currentProgress = 0 // Progreso actual (0 a 100)
let elapsedTime = 0 // Tiempo transcurrido en milisegundos

// ============================================
// Esta función hace que el progreso sea más rápido al inicio
// y más lento al final, creando un efecto más natural
function easeOutCubic(t) {
  // t es un valor entre 0 y 1
  // La fórmula matemática crea una curva suave
  return 1 - Math.pow(1 - t, 3)
}

// ============================================
// FUNCIÓN PARA ACTUALIZAR EL PROGRESO => Incrementar el tiempo transcurrido
function updateProgress() {
  elapsedTime += UPDATE_INTERVAL
  

  // Calcular el progreso lineal (0 a 1)
  const linearProgress = elapsedTime / TOTAL_DURATION

  // Aplicar la función de easing para hacerlo no lineal
  const easedProgress = easeOutCubic(linearProgress)

  // Convertir a porcentaje (0 a 100)
  currentProgress = Math.min(easedProgress * 100, 100)

  // Actualizar la barra de progreso
  progressBar.style.width = currentProgress + "%"

  // Actualizar el texto del porcentaje (sin decimales)
  loadingPercentage.textContent = Math.floor(currentProgress) + "%"

// Verificar si llegamos al 100%
  if (currentProgress >= 100) {
    // Detener el intervalo
    clearInterval(loadingInterval)

    // Esperar un momento y luego ocultar el loading
    setTimeout(hideLoading, 500)
  }
}

// ============================================
// FUNCIÓN PARA OCULTAR EL LOADING
function hideLoading() {
  // Agregar clase para animar la desaparición
  loadingContainer.classList.add("hidden")

  // Después de la animación, mostrar el contenido principal
  setTimeout(() => {
    loadingContainer.style.display = "none"
    mainContent.style.display = "flex"
  }, 500) // 500ms = duración de la transición en CSS
}

// ============================================
// INICIAR EL LOADING CUANDO SE CARGA LA PÁGINA
let loadingInterval

// Esperar a que el DOM esté completamente cargado
window.addEventListener("load", () => {
  console.log("[v0] Página cargada, iniciando loading...")

  // Iniciar el intervalo que actualiza el progreso
  loadingInterval = setInterval(updateProgress, UPDATE_INTERVAL)
})

// ============================================
// EXPLICACIÓN:
// ============================================
// 1. Cuando la página carga, se ejecuta el evento 'load'
// 2. Iniciamos un setInterval que llama a updateProgress cada 50ms
// 3. updateProgress calcula cuánto tiempo ha pasado
// 4. Usa la función easeOutCubic para hacer el progreso no lineal
// 5. Actualiza la barra y el porcentaje en pantalla
// 6. Cuando llega a 100%, detiene el intervalo y oculta el loading
// 7. Finalmente muestra el contenido principal de la página
