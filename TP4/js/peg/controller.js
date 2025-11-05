
// Esta clase gestiona eventos del mouse, drag & drop y controles del juego


class Controller {
  constructor(model, view, timer) {
    this.model = model
    this.view = view
    this.timer = timer   // Timer para el límite de tiempo

    // Estado del juego
    this.juegoIniciado = false  
    this.mostrarPantallaInicio = true  

    // Estado del drag & drop 
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
    
    // BOTÓN "COMENZAR A JUGAR" 
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

    // Presionar el mouse (inicio del arrastre)
    this.view.canvas.addEventListener("mousedown", (e) => {
      // Solo permitir drag si el juego ya comenzó
      if (this.juegoIniciado) {
        this.manejarMouseDown(e)
      }
    })

    // Mover el mouse (arrastrando)
    this.view.canvas.addEventListener("mousemove", (e) => {
      // Solo permitir drag si el juego ya comenzó
      if (this.juegoIniciado) {
        this.manejarMouseMove(e)
      }
    })

    // soltar el mouse (fin del arrastre)
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

  
  // Aquí es donde arranca el juego, click en "Comenzar"
  iniciarJuego() {
    

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

  // Maneja el evento de tiempo agotado
  tiempoAgotado() {
    

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

  
  // Presionar el mouse sobre una ficha 
  manejarMouseDown(event) {
   
    // Necesitamos convertir las coordenadas de la pantalla a coordenadas del canvas
    const rect = this.view.canvas.getBoundingClientRect()
    const canvasX = event.clientX - rect.left   // Posición X dentro del canvas
    const canvasY = event.clientY - rect.top    // Posición Y dentro del canvas

    // Convertir píxeles a posición del tablero
    const position = this.view.obtenerPosicionTablero(canvasX, canvasY)

    // Si hizo click fuera del tablero, ignorar
    if (!position) return

    const { row, col } = position   // Extraer fila y columna
    const board = this.model.obtenerTablero()

    // PASO 1C: ¿Hay una ficha en esa posición?
    // board[row][col] === 1 significa que hay una ficha
    const hayFicha = (board[row][col] === 1)
    if (!hayFicha) return   // Si no hay ficha, no hacemos nada

    //Comenzar el arrastre
    this.dragging = true                           // Activar modo arrastre
    this.draggedPeg = { row, col }                 // Guardar cuál ficha estamos arrastrando
    this.dragPosition = { x: canvasX, y: canvasY } // Posición inicial del mouse
    this.dragStartPosition = { row, col }          // Guardar posición original (por si hay que devolverla)

    // Marcar la ficha como seleccionada (se pone naranja y muestra hints)
    this.model.seleccionarFicha(row, col)
  }

  
  // Mover el mouse (arrastrando la ficha)
 
  manejarMouseMove(event) {
    
    if (!this.dragging) return   // Si no arrastramos, ignorar el movimiento del mouse

    //Actualizamos la posición del mouse mientras se mueve
    const rect = this.view.canvas.getBoundingClientRect()
    this.dragPosition.x = event.clientX - rect.left   // Nueva posición X
    this.dragPosition.y = event.clientY - rect.top    // Nueva posición Y

    
  }

  
  // Soltar el mouse (intentar colocar la ficha)  
  manejarMouseUp(event) {
  
    if (!this.dragging) return   // Si no arratramos ficha, ignoramos

    // Dónde se solto la ficha
    const rect = this.view.canvas.getBoundingClientRect()
    const canvasX = event.clientX - rect.left
    const canvasY = event.clientY - rect.top

    // Convertir píxeles a posición del tablero 
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

    
    if (!movimientoExitoso) {
      // Mostrar mensaje de movimiento inválido
      this.view.showInvalidMove()
      
      // La ficha vuelve a su lugar de origen
      this.model.deseleccionarFicha()
      
      // Limpiar el estado del drag
      this.dragging = false
      this.draggedPeg = null
      this.dragStartPosition = null
      return  
    }

    

    // ver si se termino el juego
    const juegoTerminado = this.model.juegoTerminado()
    
    if (juegoTerminado) {
      // Detener el timer porque el juego terminó
      this.timer.detener()
      
      // Esperar medio segundo antes de mostrar el mensaje (para que se vea el último movimiento)
      setTimeout(() => {
        // ¿Ganó o perdió?
        const ganoElJuego = this.model.juegoGanado()
        
        if (ganoElJuego) {
          // si solo Solo queda 1 ficha en el centro
          const movimientosRealizados = this.model.obtenerMovimientos()
          const tiempoRestante = this.timer.obtenerTiempoRestante()
          this.view.mostrarMensajeVictoria(movimientosRealizados, tiempoRestante)
        } else {
          // No hay más movimientos posibles
          const movimientosRealizados = this.model.obtenerMovimientos()
          const fichasRestantes = this.model.contarFichas()
          this.view.mostrarMensajeGameOver(movimientosRealizados, fichasRestantes)
        }
      }, 500)   
    }

    // Limpiar el estado del drag
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

    //Reiniciar el timer
    this.timer.reiniciar()
    this.timer.iniciar()

    // Resetear el modelo y la vista
    this.model.reiniciar()
    this.view.ocultarMensajeVictoria()
    this.view.ocultarMensajeGameOver()
    this.view.ocultarMensajeTiempoAgotado()  
    this.view.renderizar(this.model)

    // Reactivar el juego
    this.juegoIniciado = true
  }
}

// Exportar la clase Controller
export { Controller }
