// Cuenta regresiva desde 2 minutos (120 segundos) hasta 0

class Timer {
  constructor() {    
    this.tiempoMaximo = 120         // 120 segundos
    this.tiempoRestante = 120       // Tiempo que queda 
    this.timerActivo = false         // ¿El timer está corriendo?
    this.intervaloId = null          // ID del setInterval (para poder detenerlo)
    
    //  obtengo elemento HTML donde se muestra el tiempo
    this.displayElement = document.getElementById("timer-display")
    
     // Función a ejecutar al terminar el tiempo
    this.onTimeUp = () => {}  // ← función vacía por defecto
  }

  
  iniciar() {
    // Si ya está activo, no hacer nada
    if (this.timerActivo) return    

    //Marcar como activo
    this.timerActivo = true

    //Actualizar la visualización inicial
    this.actualizarDisplay()

    //se ejecuta cada 1 segundo
    this.intervaloId = setInterval(() => {
      this.actualizar()  
    }, 1000)
  }

  
  actualizar() {
    // le resto 1 segundo
    this.tiempoRestante--

    // actualizo la pantalla
    this.actualizarDisplay()

    // si se acabó el tiempo
    if (this.tiempoRestante <= 0) {
      this.tiempoTerminado()
    }

    // advertencia cuando quedan 30 segundos 
    if (this.tiempoRestante <= 30 && this.tiempoRestante > 0) {
      this.mostrarAdvertencia()
    }
  }

 
  tiempoTerminado() {    

    
    this.detener()

    this.tiempoRestante = 0
    this.actualizarDisplay()

    // Ejecutar el callback
    this.onTimeUp() 
  }

  
  detener() {
    // detiene la cuenta regresiva
    if (this.intervaloId) {
      clearInterval(this.intervaloId)
      this.intervaloId = null
    }
    
    this.timerActivo = false
   
  }

  
  reiniciar() {    

    // Detiene el timer actual
    this.detener()

    // restaura tiempo máximo
    this.tiempoRestante = this.tiempoMaximo

    
    this.actualizarDisplay()

    // Quita la advertencia visual 
    this.quitarAdvertencia()
  }

  
  // mostrar tiempo)  // ========================================
  actualizarDisplay() {
    // Convertir segundos a formato MM:SS    
    const minutos = Math.floor(this.tiempoRestante / 60)  // 125 seg → 2 min
    const segundos = this.tiempoRestante % 60              // 125 seg → 5 seg

    //Agregar ceros a la izquierda si es necesario (00:05 en vez de 0:5)
    const minutosFormateados = String(minutos).padStart(2, '0')
    const segundosFormateados = String(segundos).padStart(2, '0')

    // Crear el texto final (ejemplo: "02:00")
    const textoTiempo = `${minutosFormateados}:${segundosFormateados}`

    //Actualizo el HTML
    if (this.displayElement) {
      this.displayElement.textContent = textoTiempo
    }
  }

  
  //advertencia que quedan pocos segundos
  mostrarAdvertencia() {
    if (this.displayElement) {
      // Agregar clase CSS para color rojo parpadeante
      this.displayElement.classList.add("timer-warning")
    }
  }

  
  quitarAdvertencia() {
    if (this.displayElement) {
      this.displayElement.classList.remove("timer-warning")
    }
  }

  
  obtenerTiempoRestante() {
    return this.tiempoRestante
  }

 
  estaActivo() {
    return this.timerActivo
  }

 //le paso por parametro una función que se ejecutará al terminar el tiempo
  establecerAlTerminar(callback) {
    this.onTimeUp = callback
  }
}


export { Timer }
