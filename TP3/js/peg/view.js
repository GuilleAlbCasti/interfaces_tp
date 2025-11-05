// VISTA (View) - Maneja todo el renderizado en el canvas
// Esta clase se encarga de dibujar el tablero, las fichas y los efectos visuales

import { FichaPeg } from "./ficha.js"

class View {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId)
    this.ctx = this.canvas.getContext("2d")

    this.width = this.canvas.width   // 890
    this.height = this.canvas.height // 690

    
    const espacioDisponible = this.width * 0.8
    
    // Tamaño de cada celda del tablero (7x7 grid)
    this.cellSize = espacioDisponible / 7
    
    // Tamaño total del tablero
    this.boardSize = this.cellSize * 7
    
    // Offset para centrar el tablero en el canvas
    this.offsetX = (this.width - this.boardSize) /2
    this.offsetY = (this.height - this.boardSize) / 2

    // Radio de las fichas
    this.pegRadius = this.cellSize * 0.35

    // Colores del juego
    this.colors = {
      background: "#0d4175ff",
      board: "#ecf0f1",
      hole: "#505457ff",
      peg: "#e74c3c",
      pegShadow: "#c0392b",
      selected: "#f39c12",
      validMove: "#2ecc71",
      hint: "#3498db",
    }

    // NUEVO: Cargar imagen de fondo
    this.imagenFondo = new Image()
    this.imagenFondo.src = "../img/Peg_Fondo.jpg"

    // NUEVO: Cargar imagen de inicio
    this.imagenInicio = new Image()
    this.imagenInicio.src = "../img/Peg_0.jpg"

    // Para la animación de los hints (pistas visuales)
    // animationTime se incrementa constantemente para crear el efecto pulsante
    this.animationTime = 0
    this.isAnimating = false

    // NUEVO: Mapa de fichas persistentes
    // Guardamos las fichas para que mantengan su imagen asignada
    // Clave: "row-col" (ejemplo: "3-4")
    // Valor: objeto FichaPeg
    this.fichasMap = new Map()
  }

  // Inicia la animación continua de los hints
  iniciarAnimacion() {
    // Si ya está animando, no hacer nada
    if (this.isAnimating) return
    
    this.isAnimating = true
    this.animar()
  }

  // Detiene la animación de los hints
  detenerAnimacion() {
    this.isAnimating = false
  }

  // Loop de animación - se ejecuta constantemente
  animar() {
    // Si se detuvo la animación, salir
    if (!this.isAnimating) return
    
    // Incrementar el tiempo (esto hace que el efecto pulse)
    this.animationTime += 0.05
    
    // Llamar a esta función de nuevo en el próximo frame
    requestAnimationFrame(() => this.animar())
  }

  // Dibuja todo el juego (tablero, fichas, selección, animaciones)
  // model: contiene el estado del juego (tablero, ficha seleccionada, etc.)
  // dragInfo: información de la ficha que se está arrastrando (null si no hay ninguna)
  renderizar(model, dragInfo = null) {
    // PASO 1: Limpiar el canvas (borrar todo lo anterior)
    this.limpiarCanvas()

    // PASO 2: Dibujar el fondo griz oscuro
    this.dibujarFondo()

    // PASO 2.5: Dibujar cuadrados negros sobre las zonas inválidas
    this.dibujarZonasInvalidas()
    
    // PASO 2.6: Dibujar rectángulos negros en los laterales
    this.dibujarZonasInvalidasLaterales()

    // PASO 3: Dibujar el tablero y todas las fichas
    // Si hay una ficha siendo arrastrada, NO dibujarla en su posición original
    this.dibujarTablero(model.obtenerTablero(), model.obtenerFichaSeleccionada(), dragInfo)

    // PASO 4: ¿Hay una ficha seleccionada? Si sí, mostrar los hints (círculos azules)
    const fichaSeleccionada = model.obtenerFichaSeleccionada()
    if (fichaSeleccionada) {
      const movimientosValidos = model.obtenerMovimientosValidos()
      this.dibujarPistas(movimientosValidos, fichaSeleccionada)
    }

    // PASO 5: ¿Hay una ficha siendo arrastrada? Si sí, dibujarla flotando en el mouse
    const hayDrag = dragInfo && dragInfo.dragging
    if (hayDrag) {
      const mouseX = dragInfo.position.x
      const mouseY = dragInfo.position.y
      const pegArrastrado = dragInfo.peg  // {row, col} de la ficha
      this.dibujarFichaArrastrada(mouseX, mouseY, pegArrastrado)
    }

    // PASO 6: Actualizar los números en pantalla (movimientos y fichas restantes)
    this.actualizarInfo(model.obtenerMovimientos(), model.contarFichas())
  }

  // Limpia todo el canvas
  limpiarCanvas() {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }

    // Dibuja la imagen de fondo (con transparencia)
  dibujarFondo() {
    // Verificar si la imagen ya se cargó
    if (this.imagenFondo.complete && this.imagenFondo.naturalHeight !== 0) {
      // Establecer transparencia del fondo (0.6 = 60% de opacidad)
      this.ctx.globalAlpha = 0.6
      
      // Dibujar la imagen cubriendo todo el canvas
      this.ctx.drawImage(this.imagenFondo, 0, 0, this.width, this.height)
      
      // Restaurar opacidad normal para el resto del dibujo
      this.ctx.globalAlpha = 1.0
    } else {
      // Si la imagen aún no se cargó, usar el color de respaldo
      this.ctx.fillStyle = this.colors.background
      this.ctx.fillRect(0, 0, this.width, this.height)
    }
  }

  // Dibuja cuadrados negros sobre las zonas inválidas (4 esquinas)
  dibujarZonasInvalidas() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)"  // Negro semi-transparente
    
    // Esquina superior izquierda (2x2 celdas)
    this.ctx.fillRect(this.offsetX, this.offsetY, this.cellSize * 2, this.cellSize * 2)
    
    // Esquina superior derecha (2x2 celdas)
    this.ctx.fillRect(this.offsetX + this.cellSize * 5, this.offsetY, this.cellSize * 2, this.cellSize * 2)
    
    // Esquina inferior izquierda (2x2 celdas)
    this.ctx.fillRect(this.offsetX, this.offsetY + this.cellSize * 5, this.cellSize * 2, this.cellSize * 2)
    
    // Esquina inferior derecha (2x2 celdas)
    this.ctx.fillRect(this.offsetX + this.cellSize * 5, this.offsetY + this.cellSize * 5, this.cellSize * 2, this.cellSize * 2)
  }

  dibujarZonasInvalidasLaterales() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)"  // Negro semi-transparente

    // Zona lateral izquierda: desde el borde del canvas (x=0) hasta el borde izquierdo del tablero
    this.ctx.fillRect(0, this.offsetY, this.offsetX, this.cellSize * 7)
    
    // Zona lateral derecha: desde el borde derecho del tablero hasta el borde del canvas
    const bordeDerechoTablero = this.offsetX + this.boardSize  // Posición donde termina el tablero
    const anchoZonaDerecha = this.width - bordeDerechoTablero  // Ancho desde fin del tablero hasta fin del canvas
    this.ctx.fillRect(bordeDerechoTablero, this.offsetY, anchoZonaDerecha, this.cellSize * 7)
  }

  // Dibuja el tablero completo con todas las fichas
  // board: la matriz 7x7 del tablero (0=inválido, 1=ficha, 2=vacío)
  // selectedPeg: la ficha seleccionada (para dibujarla naranja)
  // dragInfo: si hay una ficha siendo arrastrada, NO la dibujamos en su lugar original
  dibujarTablero(board, selectedPeg, dragInfo = null) {
    // Recorrer todas las celdas del tablero (7 filas x 7 columnas)
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        const cellValue = board[row][col]

        // Calcular la posición en píxeles (centro de la celda) + offset para centrar
        const x = this.offsetX + col * this.cellSize + this.cellSize / 2
        const y = this.offsetY + row * this.cellSize + this.cellSize / 2

        // ¿Es una celda válida? (no es 0)
        const esValida = (cellValue !== 0)
        if (esValida) {
          this.dibujarAgujero(x, y)   // Dibujar el agujero gris
        }

        // ¿Hay una ficha en esta celda? (cellValue === 1)
        const hayFicha = (cellValue === 1)
        if (hayFicha) {
          // ⚠️ IMPORTANTE: Si esta ficha está siendo arrastrada, NO dibujarla aquí
          // (se dibujará flotando en la posición del mouse)
          const estaFichaSiendoArrastrada = 
            dragInfo && 
            dragInfo.dragging && 
            dragInfo.peg.row === row && 
            dragInfo.peg.col === col
          
          if (estaFichaSiendoArrastrada) {
            continue   // Saltar al siguiente for (no dibujar esta ficha)
          }

          // PASO 1: Obtener o crear la ficha para esta posición
          const key = `${row}-${col}`
          let ficha = this.fichasMap.get(key)
          
          // Si no existe, crear una nueva y guardarla
          if (!ficha) {
            ficha = new FichaPeg(row, col)
            this.fichasMap.set(key, ficha)
          }

          // PASO 2: Actualizar el estado de selección
          const estaSeleccionada = selectedPeg && selectedPeg.row === row && selectedPeg.col === col
          if (estaSeleccionada) {
            ficha.seleccionar()   // La ficha tendrá borde dorado
          } else {
            ficha.deseleccionar() // Quitar selección
          }
          
          // PASO 3: Dibujar la ficha en su posición
          this.dibujarFicha(ficha, x, y)
        }
      }
    }
  }

  // Dibuja un agujero (espacio donde puede haber una ficha)
  dibujarAgujero(x, y) {
    this.ctx.fillStyle = this.colors.hole
    this.ctx.beginPath()
    this.ctx.arc(x, y, this.pegRadius, 0, Math.PI * 2)
    this.ctx.fill()

    // Sombra interior para dar efecto de profundidad
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
    this.ctx.beginPath()
    this.ctx.arc(x, y + 2, this.pegRadius * 0.8, 0, Math.PI * 2)
    this.ctx.fill()
  }

  // Dibuja una ficha
  dibujarFicha(ficha, x, y) {
    ficha.dibujar(this.ctx, x, y, this.pegRadius, this.colors)
  }

  // Dibuja la ficha que se está arrastrando (flotando sobre el tablero)
  // x, y: posición del mouse en píxeles
  // pegPosition: {row, col} de la ficha que se está arrastrando
  dibujarFichaArrastrada(x, y, pegPosition) {
    // PASO 1: Dibujar una sombra debajo de la ficha
    // Esto da el efecto de que la ficha está "flotando" sobre el tablero
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.3)"   // Negro semi-transparente
    this.ctx.beginPath()
    this.ctx.arc(x + 5, y + 5, this.pegRadius * 1.1, 0, Math.PI * 2)   // Desplazada 5px
    this.ctx.fill()

    // PASO 2: Obtener la ficha real del mapa (para mantener su imagen)
    const key = `${pegPosition.row}-${pegPosition.col}`
    let ficha = this.fichasMap.get(key)
    
    // Si por alguna razón no existe, crear una temporal
    if (!ficha) {
      ficha = new FichaPeg(pegPosition.row, pegPosition.col)
    }
    
    ficha.seleccionar()   // Marcarla como seleccionada (borde dorado)

    // PASO 3: Dibujar la ficha un poco más grande
    const radioAgrandado = this.pegRadius * 1.15
    ficha.dibujar(this.ctx, x, y, radioAgrandado, this.colors)
  }

  // Dibuja los hints (pistas visuales) para mostrar dónde puede mover la ficha
  dibujarPistas(validMoves, selectedPeg) {
    // PASO 1: Calcular el "pulso" - un valor que crece y decrece para animar
    // Math.sin crea un valor que oscila entre -1 y 1
    // Lo convertimos para que oscile entre 0.4 y 1.0
    const sineWave = Math.sin(this.animationTime)  // Valor entre -1 y 1
    const pulse = sineWave * 0.3 + 0.7             // Valor entre 0.4 y 1.0

    // PASO 2: Dibujar un círculo en cada posición válida
    for (const move of validMoves) {
      // Calcular posición en píxeles (centro de la celda) + offset
      const x = this.offsetX + move.col * this.cellSize + this.cellSize / 2
      const y = this.offsetY + move.row * this.cellSize + this.cellSize / 2

      // Dibujar círculo relleno (más transparente)
      const transparencia = 0.3 * pulse  // La transparencia también pulsa
      this.ctx.fillStyle = `rgba(52, 152, 219, ${transparencia})`
      this.ctx.beginPath()
      this.ctx.arc(x, y, this.pegRadius * 1.2 * pulse, 0, Math.PI * 2)
      this.ctx.fill()

      // Dibujar borde del círculo (menos transparente)
      const transparenciaBorde = 0.8 * pulse
      this.ctx.strokeStyle = `rgba(52, 152, 219, ${transparenciaBorde})`
      this.ctx.lineWidth = 3
      this.ctx.beginPath()
      this.ctx.arc(x, y, this.pegRadius * 1.2 * pulse, 0, Math.PI * 2)
      this.ctx.stroke()

      // PASO 3: Dibujar flecha desde la ficha seleccionada hasta aquí
      this.dibujarFlecha(selectedPeg, move, pulse)
    }
  }

  // Dibuja una flecha curva animada desde la ficha seleccionada hasta el destino
  dibujarFlecha(from, to, pulse) {
    // PASO 1: Calcular las coordenadas en píxeles + offset
    // Posición de inicio (ficha seleccionada)
    const inicioX = this.offsetX + from.col * this.cellSize + this.cellSize / 2
    const inicioY = this.offsetY + from.row * this.cellSize + this.cellSize / 2
    
    // Posición de destino (donde puede mover)
    const destinoX = this.offsetX + to.col * this.cellSize + this.cellSize / 2
    const destinoY = this.offsetY + to.row * this.cellSize + this.cellSize / 2

    // PASO 2: Calcular punto medio (donde está la ficha que se va a saltar)
    const puntoMedioX = (inicioX + destinoX) / 2
    const puntoMedioY = (inicioY + destinoY) / 2

    // PASO 3: Configurar el color y grosor de la flecha (también pulsa)
    const transparencia = 0.6 * pulse
    this.ctx.strokeStyle = `rgba(52, 152, 219, ${transparencia})`
    this.ctx.fillStyle = `rgba(52, 152, 219, ${transparencia})`
    this.ctx.lineWidth = 3

    // PASO 4: Dibujar la línea curva
    this.ctx.beginPath()
    this.ctx.moveTo(inicioX, inicioY)  // Empezar en la ficha seleccionada
    
    // Crear un arco hacia arriba para que se vea bonito
    const alturaDelArco = 20
    const puntoControlX = puntoMedioX
    const puntoControlY = puntoMedioY - alturaDelArco  // Restar para ir hacia arriba
    
    // Dibujar curva desde inicio hasta destino
    this.ctx.quadraticCurveTo(puntoControlX, puntoControlY, destinoX, destinoY)
    this.ctx.stroke()

    // PASO 5: Dibujar la punta de la flecha (un triángulo)
    // Calcular el ángulo hacia dónde apunta la flecha
    const anguloFlecha = Math.atan2(destinoY - puntoControlY, destinoX - puntoControlX)
    const largoFlecha = 15
    
    // Dibujar un triángulo en el destino
    this.ctx.beginPath()
    this.ctx.moveTo(destinoX, destinoY)  // Punta de la flecha
    
    // Lado izquierdo del triángulo
    this.ctx.lineTo(
      destinoX - largoFlecha * Math.cos(anguloFlecha - Math.PI / 6),
      destinoY - largoFlecha * Math.sin(anguloFlecha - Math.PI / 6)
    )
    
    // Lado derecho del triángulo
    this.ctx.lineTo(
      destinoX - largoFlecha * Math.cos(anguloFlecha + Math.PI / 6),
      destinoY - largoFlecha * Math.sin(anguloFlecha + Math.PI / 6)
    )
    
    this.ctx.closePath()
    this.ctx.fill()  // Rellenar el triángulo
  }

  // Convierte coordenadas del canvas a posición en el tablero
  obtenerPosicionTablero(canvasX, canvasY) {
    // Restar el offset para obtener la posición relativa al tablero
    const relativeX = canvasX - this.offsetX
    const relativeY = canvasY - this.offsetY
    
    const col = Math.floor(relativeX / this.cellSize)
    const row = Math.floor(relativeY / this.cellSize)

    // Verificar que esté dentro de los límites
    if (row >= 0 && row < 7 && col >= 0 && col < 7) {
      return { row, col }
    }
    return null
  }

  // Actualiza la información en pantalla 
  actualizarInfo(moves, pegsCount) {
    document.getElementById("moves-count").textContent = moves    // Actualiza el contador de movimientos
    document.getElementById("pegs-count").textContent = pegsCount // Actualiza el contador de fichas
  }

  // Muestra el mensaje de victoria
  mostrarMensajeVictoria(moves, timeRemaining) {
    const victoryDiv = document.getElementById("victory-message")
    document.getElementById("final-moves").textContent = moves
    
    // Mostrar el tiempo restante en formato MM:SS
    const minutos = Math.floor(timeRemaining / 60)
    const segundos = timeRemaining % 60
    const tiempoFormateado = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`
    document.getElementById("final-time").textContent = tiempoFormateado
    
    victoryDiv.classList.remove("hidden")
  }

  // Oculta el mensaje de victoria
  ocultarMensajeVictoria() {
    const victoryDiv = document.getElementById("victory-message")
    victoryDiv.classList.add("hidden")
    
    // NUEVO: Limpiar el mapa de fichas al reiniciar
    this.limpiarFichas()
  }

  // Limpia el mapa de fichas (se usa al reiniciar el juego)
  // Esto hace que se generen nuevas fichas con nuevas imágenes aleatorias
  limpiarFichas() {
    this.fichasMap.clear()
  }

  // Muestra el mensaje de game over (sin movimientos posibles)
  mostrarMensajeGameOver(moves, pegsRemaining) {
    // Crear el elemento del mensaje si no existe
    let messageDiv = document.getElementById("game-over-message")
    
    if (!messageDiv) {
      messageDiv = document.createElement("div")
      messageDiv.id = "game-over-message"
      messageDiv.className = "victory-message"  // Reutilizar los mismos estilos
      messageDiv.innerHTML = `
        <h2 style="color: #e74c3c;">😔 Juego Terminado</h2>
        <p>No hay más movimientos posibles</p>
        <p>Realizaste <span id="final-moves-gameover" style="color: #3498db; font-weight: bold;">0</span> movimientos</p>
        <p>Quedaron <span id="final-pegs-gameover" style="color: #e74c3c; font-weight: bold;">0</span> fichas</p>
        <button id="play-again-gameover-btn" class="control-btn">Intentar de Nuevo</button>
      `
      document.body.appendChild(messageDiv)
      
      // Event listener para el botón
      document.getElementById("play-again-gameover-btn").addEventListener("click", () => {
        messageDiv.classList.add("hidden")
        // El resetGame se maneja en el controller
        const event = new CustomEvent('gameReset')
        document.dispatchEvent(event)
      })
    }
    
    // Actualizar valores
    document.getElementById("final-moves-gameover").textContent = moves
    document.getElementById("final-pegs-gameover").textContent = pegsRemaining
    
    // Mostrar el mensaje
    messageDiv.classList.remove("hidden")
  }

  // Oculta el mensaje de game over
  ocultarMensajeGameOver() {
    const gameOverDiv = document.getElementById("game-over-message")
    if (gameOverDiv) {
      gameOverDiv.classList.add("hidden")
    }
    
    // NUEVO: Limpiar el mapa de fichas al reiniciar
    this.limpiarFichas()
  }

  // Muestra el mensaje de tiempo agotado
  mostrarMensajeTiempoAgotado(moves, pegsRemaining) {
    // Crear el elemento del mensaje si no existe
    let messageDiv = document.getElementById("time-up-message")
    
    if (!messageDiv) {
      messageDiv = document.createElement("div")
      messageDiv.id = "time-up-message"
      messageDiv.className = "victory-message"  // Reutilizar los mismos estilos
      messageDiv.innerHTML = `
        <h2 style="color: #e67e22;">⏰ ¡Tiempo Agotado!</h2>
        <p>Se acabaron los 2 minutos</p>
        <p>Realizaste <span id="final-moves-timeup" style="color: #3498db; font-weight: bold;">0</span> movimientos</p>
        <p>Quedaron <span id="final-pegs-timeup" style="color: #e74c3c; font-weight: bold;">0</span> fichas</p>
        <button id="play-again-timeup-btn" class="control-btn">Intentar de Nuevo</button>
      `
      document.body.appendChild(messageDiv)
      
      // Agregar event listener al botón
      document.getElementById("play-again-timeup-btn").addEventListener("click", () => {
        messageDiv.classList.add("hidden")
        document.dispatchEvent(new Event('gameReset'))
      })
    }
    
    // Actualizar valores
    document.getElementById("final-moves-timeup").textContent = moves
    document.getElementById("final-pegs-timeup").textContent = pegsRemaining
    
    // Mostrar el mensaje
    messageDiv.classList.remove("hidden")
  }

  // Oculta el mensaje de tiempo agotado
  ocultarMensajeTiempoAgotado() {
    const timeUpDiv = document.getElementById("time-up-message")
    if (timeUpDiv) {
      timeUpDiv.classList.add("hidden")
    }
    
    // NUEVO: Limpiar el mapa de fichas al reiniciar
    this.limpiarFichas()
  } 

  // Muestra un mensaje de movimiento inválido
  showInvalidMove() {
    // Crear el elemento del mensaje si no existe
    let messageDiv = document.getElementById("invalid-move-message")
    
    if (!messageDiv) {
      messageDiv = document.createElement("div")
      messageDiv.id = "invalid-move-message"
      messageDiv.className = "invalid-move-message"
      messageDiv.innerHTML = `
        <div class="invalid-move-content">
          <h3>⚠️ Movimiento Inválido</h3>
          <p>No puedes mover la ficha a esa posición.</p>
          <p>Recuerda: debes saltar sobre una ficha adyacente a un espacio vacío.</p>
          <button id="close-invalid-btn" class="control-btn">Entendido</button>
        </div>
      `
      document.body.appendChild(messageDiv)
      
      // Event listener para cerrar el mensaje
      document.getElementById("close-invalid-btn").addEventListener("click", () => {
        messageDiv.classList.add("hidden")
      })
    }
    
    // Mostrar el mensaje
    messageDiv.classList.remove("hidden")
  }

  // Dibuja la pantalla de inicio con la imagen Peg_0.jpg
  dibujarPantallaInicio() {
    // Limpiar canvas
    this.ctx.fillStyle = this.colors.background
    this.ctx.fillRect(0, 0, this.width, this.height)

    // Dibujar la imagen de inicio centrada y escalada
    if (this.imagenInicio.complete) {
      // Calcular dimensiones para mantener proporción
      const aspectRatio = this.imagenInicio.width / this.imagenInicio.height
      let imgWidth, imgHeight

      if (aspectRatio > this.width / this.height) {
        // Imagen más ancha - ajustar al ancho del canvas
        imgWidth = this.width
        imgHeight = this.width / aspectRatio * 1.25
      } else {
        // Imagen más alta - ajustar al alto del canvas
        imgHeight = this.height
        imgWidth = this.height * aspectRatio
      }

      // Centrar la imagen
      const x = (this.width - imgWidth) / 2
      const y = (this.height - imgHeight) / 2

      // Dibujar imagen
      this.ctx.drawImage(this.imagenInicio, x, y, imgWidth, imgHeight)
    }
  }
}

// Exportar la clase View
export { View }
