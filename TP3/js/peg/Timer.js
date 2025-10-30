// TIMER - Clase para manejar el tiempo límite del juego
// Cuenta regresiva desde 2 minutos (120 segundos) hasta 0

class Timer {
  constructor() {
    // PASO 1: Configuración inicial del timer
    this.tiempoMaximo = 120          // 2 minutos = 120 segundos
    this.tiempoRestante = 120        // Tiempo que queda (empieza en 120)
    this.timerActivo = false         // ¿El timer está corriendo?
    this.intervaloId = null          // ID del setInterval (para poder detenerlo)
    
    // PASO 2: Obtener el elemento HTML donde se muestra el tiempo
    this.displayElement = document.getElementById("timer-display")
    
    // PASO 3: Callback que se ejecutará cuando el tiempo llegue a 0
    this.onTimeUp = null             // Función a ejecutar al terminar el tiempo
  }

  // ========================================
  // INICIAR el timer (cuenta regresiva)
  // ========================================
  iniciar() {
    // Si ya está activo, no hacer nada
    if (this.timerActivo) return

    console.log("⏰ Timer iniciado - 2 minutos")

    // PASO 1: Marcar como activo
    this.timerActivo = true

    // PASO 2: Actualizar la visualización inicial
    this.actualizarDisplay()

    // PASO 3: Crear un intervalo que se ejecuta cada 1 segundo (1000 milisegundos)
    this.intervaloId = setInterval(() => {
      this.actualizar()  // Llamar al método actualizar cada segundo
    }, 1000)
  }

  // ========================================
  // ACTUALIZAR - Se ejecuta cada segundo
  // ========================================
  actualizar() {
    // PASO 1: Restar 1 segundo
    this.tiempoRestante--

    // PASO 2: Actualizar la pantalla
    this.actualizarDisplay()

    // PASO 3: ¿Se acabó el tiempo?
    if (this.tiempoRestante <= 0) {
      this.tiempoTerminado()
    }

    // PASO 4: Advertencia visual cuando quedan 30 segundos o menos
    if (this.tiempoRestante <= 30 && this.tiempoRestante > 0) {
      this.mostrarAdvertencia()
    }
  }

  // ========================================
  // TIEMPO TERMINADO (llegó a 0)
  // ========================================
  tiempoTerminado() {
    console.log("⏰ ¡Se acabó el tiempo!")

    // PASO 1: Detener el timer
    this.detener()

    // PASO 2: Asegurar que muestre 00:00
    this.tiempoRestante = 0
    this.actualizarDisplay()

    // PASO 3: Ejecutar el callback si existe
    if (this.onTimeUp && typeof this.onTimeUp === 'function') {
      this.onTimeUp()
    }
  }

  // ========================================
  // DETENER el timer
  // ========================================
  detener() {
    // Limpiar el intervalo (detener la cuenta regresiva)
    if (this.intervaloId) {
      clearInterval(this.intervaloId)
      this.intervaloId = null
    }
    
    this.timerActivo = false
    console.log("⏰ Timer detenido")
  }

  // ========================================
  // REINICIAR el timer
  // ========================================
  reiniciar() {
    console.log("⏰ Timer reiniciado")

    // PASO 1: Detener el timer actual
    this.detener()

    // PASO 2: Restaurar el tiempo máximo
    this.tiempoRestante = this.tiempoMaximo

    // PASO 3: Actualizar la visualización
    this.actualizarDisplay()

    // PASO 4: Quitar advertencia visual si la había
    this.quitarAdvertencia()
  }

  // ========================================
  // ACTUALIZAR el display (mostrar tiempo)
  // ========================================
  actualizarDisplay() {
    // PASO 1: Convertir segundos a formato MM:SS
    // Math.floor() redondea hacia abajo
    const minutos = Math.floor(this.tiempoRestante / 60)  // 125 seg → 2 min
    const segundos = this.tiempoRestante % 60              // 125 seg → 5 seg

    // PASO 2: Agregar ceros a la izquierda si es necesario (00:05 en vez de 0:5)
    const minutosFormateados = String(minutos).padStart(2, '0')
    const segundosFormateados = String(segundos).padStart(2, '0')

    // PASO 3: Crear el texto final (ejemplo: "02:00")
    const textoTiempo = `${minutosFormateados}:${segundosFormateados}`

    // PASO 4: Actualizar el HTML
    if (this.displayElement) {
      this.displayElement.textContent = textoTiempo
    }
  }

  // ========================================
  // MOSTRAR ADVERTENCIA (quedan pocos segundos)
  // ========================================
  mostrarAdvertencia() {
    if (this.displayElement) {
      // Agregar clase CSS para color rojo parpadeante
      this.displayElement.classList.add("timer-warning")
    }
  }

  // ========================================
  // QUITAR ADVERTENCIA
  // ========================================
  quitarAdvertencia() {
    if (this.displayElement) {
      this.displayElement.classList.remove("timer-warning")
    }
  }

  // ========================================
  // OBTENER tiempo restante en segundos
  // ========================================
  obtenerTiempoRestante() {
    return this.tiempoRestante
  }

  // ========================================
  // VERIFICAR si el timer está activo
  // ========================================
  estaActivo() {
    return this.timerActivo
  }

  // ========================================
  // ESTABLECER callback para cuando se acabe el tiempo
  // ========================================
  // Uso: timer.establecerAlTerminar(() => { console.log("¡Tiempo!") })
  establecerAlTerminar(callback) {
    this.onTimeUp = callback
  }
}

// Exportar la clase Timer
export { Timer }
