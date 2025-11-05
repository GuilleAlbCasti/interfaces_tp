// CONTROLADOR (Controller) - Maneja la interacción del usuario
// Esta clase gestiona eventos del mouse, drag & drop y controles del juego


class Controller {
  constructor(model, view, timer) {
    this.model = model
    this.view = view
    this.timer = timer   // NUEVO: Timer para el límite de tiempo

    // Estado del juego
    this.juegoIniciado = false   // ¿El usuario ya hizo click en "Comenzar"?
    this.mostrarPantallaInicio = true  // Mostrar pantalla de inicio al cargar

    // Estado del drag & drop (arrastrar y soltar)
    this.dragging = false              // ¿Estamos arrastrando una ficha?
    this.draggedPeg = null             // ¿Qué ficha estamos arrastrando?
    this.dragPosition = { x: 0, y: 0 } // Posición actual del mouse mientras arrastramos
    this.dragStartPosition = null      // Posición original de la ficha (por si hay que devolverla)

    // Inicializar los event listeners
    this.inicializarEventListeners()

    // Iniciar el loop de renderizado desde el principio (mostrará la pantalla de inicio)
    this.iniciarLoopRenderizado()
  }

  // Loop de renderizado continuo para animaciones
  // Este método se ejecuta 60 veces por segundo (60 FPS) para crear animaciones suaves
  iniciarLoopRenderizado() {
    const loop = () => {
      // Si debemos mostrar la pantalla de inicio, dibujarla
      if (this.mostrarPantallaInicio) {
        this.view.dibujarPantallaInicio()
        requestAnimationFrame(loop)
        return
      }

      // ¿Hay una ficha siendo arrastrada?
      let dragInfo = null
      if (this.dragging) {
        // Sí hay drag, preparar la información para la vista
        dragInfo = {
          dragging: true,
          peg: this.draggedPeg,           // ¿Qué ficha?
          position: this.dragPosition     // ¿Dónde está el mouse?
        }
      }

      // Dibujar todo el juego (con o sin drag)
      this.view.renderizar(this.model, dragInfo)
      
      // Repetir este loop en el próximo frame (60 veces por segundo)
      requestAnimationFrame(loop)
    }
    // Iniciar el loop
    requestAnimationFrame(loop)
  }

  // Configura todos los event listeners del juego
  inicializarEventListeners() {
    // ========================================
    // BOTÓN "COMENZAR A JUGAR" (en el canvas)
    // ========================================
    const startBtnCanvas = document.getElementById("start-btn-canvas")
    if (startBtnCanvas) {
      startBtnCanvas.addEventListener("click", () => {
        this.iniciarJuego()
        // Ocultar pantalla de inicio del canvas
        this.mostrarPantallaInicio = false
        // Ocultar el overlay
        const overlay = document.getElementById("start-overlay")
        if (overlay) {
          overlay.classList.remove("active")
          overlay.classList.add("hidden")
        }
        // Mostrar el panel de información
        const gameInfoPanel = document.querySelector(".game-info-panel")
        if (gameInfoPanel) {
          gameInfoPanel.classList.remove("hidden")
        }
      })
    }

    // DRAG & DROP: Presionar el mouse (inicio del arrastre)
    this.view.canvas.addEventListener("mousedown", (e) => {
      // Solo permitir drag si el juego ya comenzó
      if (this.juegoIniciado) {
        this.manejarMouseDown(e)
      }
    })

    // DRAG & DROP: Mover el mouse (arrastrando)
    this.view.canvas.addEventListener("mousemove", (e) => {
      // Solo permitir drag si el juego ya comenzó
      if (this.juegoIniciado) {
        this.manejarMouseMove(e)
      }
    })

    // DRAG & DROP: Soltar el mouse (fin del arrastre)
    this.view.canvas.addEventListener("mouseup", (e) => {
      // Solo permitir drag si el juego ya comenzó
      if (this.juegoIniciado) {
        this.manejarMouseUp(e)
      }
    })

    // Si el mouse sale del canvas mientras arrastramos, también soltar
    this.view.canvas.addEventListener("mouseleave", (e) => {
      if (this.dragging && this.juegoIniciado) {
        this.manejarMouseUp(e)
      }
    })

    // Botón de reinicio
    document.getElementById("reset-btn").addEventListener("click", () => {
      this.reiniciarJuego()
    })

    // Botón de jugar de nuevo (en el mensaje de victoria)
    document.getElementById("play-again-btn").addEventListener("click", () => {
      this.reiniciarJuego()
    })

    // Event listener para reiniciar desde el mensaje de game over
    document.addEventListener('gameReset', () => {
      this.reiniciarJuego()
    })
  }

  // ========================================
  // INICIAR EL JUEGO (cuando se hace click en "Comenzar")
  // ========================================
  // Este método se ejecuta UNA SOLA VEZ cuando el usuario hace click en el botón "Comenzar a Jugar"
  // Aquí es donde realmente "arranca" el juego
  iniciarJuego() {
    console.log("🎮 ¡Juego iniciado!")   // Para debugging (ver en la consola del navegador)

    // PASO 1: Marcar que el juego ya comenzó y ocultar pantalla de inicio
    this.juegoIniciado = true
    this.mostrarPantallaInicio = false

    // PASO 2: Ocultar la pantalla de inicio antigua (si existe)
    const startScreen = document.getElementById("start-screen")
    if (startScreen) {
      startScreen.classList.add("hidden")   // Agregar clase CSS que hace display: none
    }

    // PASO 3: Iniciar el timer de 2 minutos
    this.timer.iniciar()

    // PASO 4: Configurar qué hacer cuando se acabe el tiempo
    this.timer.establecerAlTerminar(() => {
      this.tiempoAgotado()
    })

    // PASO 5: Iniciar la animación continua de los hints (círculos azules pulsantes)
    this.view.iniciarAnimacion()      // Inicia el contador de tiempo para las animaciones
    // El loop de renderizado ya está corriendo desde el constructor

    // PASO 6: Dibujar el tablero inicial (con todas las fichas menos la del centro)
    this.view.renderizar(this.model)
  }

  // ========================================
  // TIEMPO AGOTADO (se acabaron los 2 minutos)
  // ========================================
  tiempoAgotado() {
    console.log("⏰ ¡Se acabó el tiempo!")

    // PASO 1: Detener el juego (no permitir más movimientos)
    this.juegoIniciado = false

    // PASO 2: Detener el drag si había uno activo
    this.dragging = false
    this.draggedPeg = null

    // PASO 3: Mostrar mensaje de tiempo agotado
    setTimeout(() => {
      const movimientosRealizados = this.model.obtenerMovimientos()
      const fichasRestantes = this.model.contarFichas()
      this.view.mostrarMensajeTiempoAgotado(movimientosRealizados, fichasRestantes)
    }, 500)
  }

  // ========================================
  // DRAG & DROP - PASO 1: Presionar el mouse sobre una ficha
  // ========================================
  manejarMouseDown(event) {
    // PASO 1A: ¿Dónde hizo click el usuario?
    // Necesitamos convertir las coordenadas de la pantalla a coordenadas del canvas
    const rect = this.view.canvas.getBoundingClientRect()
    const canvasX = event.clientX - rect.left   // Posición X dentro del canvas
    const canvasY = event.clientY - rect.top    // Posición Y dentro del canvas

    // PASO 1B: Convertir píxeles a posición del tablero (fila y columna)
    const position = this.view.obtenerPosicionTablero(canvasX, canvasY)

    // Si hizo click fuera del tablero, ignorar
    if (!position) return

    const { row, col } = position   // Extraer fila y columna
    const board = this.model.obtenerTablero()

    // PASO 1C: ¿Hay una ficha en esa posición?
    // board[row][col] === 1 significa que hay una ficha
    const hayFicha = (board[row][col] === 1)
    if (!hayFicha) return   // Si no hay ficha, no hacemos nada

    // PASO 1D: ✅ ¡Hay una ficha! Comenzar el arrastre
    this.dragging = true                           // Activar modo arrastre
    this.draggedPeg = { row, col }                 // Guardar cuál ficha estamos arrastrando
    this.dragPosition = { x: canvasX, y: canvasY } // Posición inicial del mouse
    this.dragStartPosition = { row, col }          // Guardar posición original (por si hay que devolverla)

    // PASO 1E: Marcar la ficha como seleccionada (se pone naranja y muestra hints)
    this.model.seleccionarFicha(row, col)
  }

  // ========================================
  // DRAG & DROP - PASO 2: Mover el mouse (arrastrando la ficha)
  // ========================================
  manejarMouseMove(event) {
    // ¿Estamos arrastrando una ficha?
    if (!this.dragging) return   // Si no, ignorar el movimiento del mouse

    // PASO 2A: Actualizar la posición del mouse mientras se mueve
    const rect = this.view.canvas.getBoundingClientRect()
    this.dragPosition.x = event.clientX - rect.left   // Nueva posición X
    this.dragPosition.y = event.clientY - rect.top    // Nueva posición Y

    // NOTA: No llamamos renderizar() aquí porque el loop de renderizado
    // ya está dibujando 60 veces por segundo automáticamente
    // (ver iniciarLoopRenderizado más arriba)
  }

  // ========================================
  // DRAG & DROP - PASO 3: Soltar el mouse (intentar colocar la ficha)
  // ========================================
  manejarMouseUp(event) {
    // ¿Estamos arrastrando una ficha?
    if (!this.dragging) return   // Si no, ignorar

    // PASO 3A: ¿Dónde soltó el usuario la ficha?
    const rect = this.view.canvas.getBoundingClientRect()
    const canvasX = event.clientX - rect.left
    const canvasY = event.clientY - rect.top

    // PASO 3B: Convertir píxeles a posición del tablero (fila y columna)
    const position = this.view.obtenerPosicionTablero(canvasX, canvasY)

    let movimientoExitoso = false

    if (position) {
      const { row, col } = position
      const board = this.model.obtenerTablero()

      // PASO 3C: ¿Se soltó en un espacio vacío?
      // board[row][col] === 2 significa espacio vacío
      const esEspacioVacio = (board[row][col] === 2)
      
      if (esEspacioVacio) {
        // Intentar realizar el movimiento (verificará si es válido)
        movimientoExitoso = this.model.realizarMovimiento(row, col)
      }
    }

    // PASO 3D: ❌ ¿El movimiento falló?
    if (!movimientoExitoso) {
      // Mostrar mensaje de movimiento inválido
      this.view.showInvalidMove()
      
      // La ficha vuelve a su lugar de origen
      this.model.deseleccionarFicha()
      
      // Limpiar el estado del drag
      this.dragging = false
      this.draggedPeg = null
      this.dragStartPosition = null
      return   // Terminar aquí
    }

    // PASO 3E: ✅ ¡El movimiento fue exitoso!
    // La ficha ya se movió en el tablero

    // PASO 3F: ¿Se terminó el juego?
    const juegoTerminado = this.model.juegoTerminado()
    
    if (juegoTerminado) {
      // Detener el timer porque el juego terminó
      this.timer.detener()
      
      // Esperar medio segundo antes de mostrar el mensaje (para que se vea el último movimiento)
      setTimeout(() => {
        // ¿Ganó o perdió?
        const ganoElJuego = this.model.juegoGanado()
        
        if (ganoElJuego) {
          // ✅ VICTORIA: Solo queda 1 ficha en el centro
          const movimientosRealizados = this.model.obtenerMovimientos()
          const tiempoRestante = this.timer.obtenerTiempoRestante()
          this.view.mostrarMensajeVictoria(movimientosRealizados, tiempoRestante)
        } else {
          // ❌ GAME OVER: No hay más movimientos posibles
          const movimientosRealizados = this.model.obtenerMovimientos()
          const fichasRestantes = this.model.contarFichas()
          this.view.mostrarMensajeGameOver(movimientosRealizados, fichasRestantes)
        }
      }, 500)   // 500 milisegundos = medio segundo
    }

    // PASO 3G: Limpiar el estado del drag
    this.dragging = false
    this.draggedPeg = null
    this.dragStartPosition = null
  }

  // Reinicia el juego
  reiniciarJuego() {
    // Resetear el estado del drag si había una ficha siendo arrastrada
    this.dragging = false
    this.draggedPeg = null
    this.dragStartPosition = null

    // NUEVO: Reiniciar el timer
    this.timer.reiniciar()
    this.timer.iniciar()

    // Resetear el modelo y la vista
    this.model.reiniciar()
    this.view.ocultarMensajeVictoria()
    this.view.ocultarMensajeGameOver()
    this.view.ocultarMensajeTiempoAgotado()  // NUEVO: ocultar mensaje de tiempo agotado
    this.view.renderizar(this.model)

    // Reactivar el juego
    this.juegoIniciado = true
  }
}

// Exportar la clase Controller
export { Controller }
