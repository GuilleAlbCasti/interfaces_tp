
// Esta clase encapsula toda la lógica relacionada con el tablero

class Tablero {
  constructor() {   
     this.board = this.inicializarTablero();
  }

  // Inicializa el tablero en su estado inicial
  // El tablero tiene forma de cruz con 33 posiciones
  inicializarTablero() {
    // Plantilla del tablero (0 = fuera del tablero, 1 = ficha, 2 = vacío)
    return [
      [0, 0, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 0, 0],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 2, 1, 1, 1], // Centro vacío (2)
      [1, 1, 1, 1, 1, 1, 1],
      [0, 0, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 0, 0],
    ];
  }

  // Obtiene el estado actual del tablero
  obtenerTablero() {
    return this.board;
  }

  // Obtiene el valor de una celda específica
  getCelda(row, col) {
    if (row < 0 || row >= 7 || col < 0 || col >= 7) {
      return 0; // Fuera del tablero
    }
    return this.board[row][col];
  }

  // Establece el valor de una celda específica
  setCelda(row, col, value) {
    if (row >= 0 && row < 7 && col >= 0 && col < 7) {
      this.board[row][col] = value;
    }
  }

  // Cuenta cuántas fichas quedan en el tablero
  contarFichas() {
    let count = 0;
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        if (this.board[row][col] === 1) {
          count++;
        }
      }
    }
    return count;
  }

  // Verifica si una posición es válida (dentro del tablero en forma de cruz)
  esPosicionValida(row, col) {
    if (row < 0 || row >= 7 || col < 0 || col >= 7) {
      return false;
    }
    return this.board[row][col] !== 0;
  }

  // Verifica si hay una ficha en la posición especificada
  tieneFicha(row, col) {
    return this.getCelda(row, col) === 1;
  }

  // Verifica si la posición está vacía
  estaVacio(row, col) {
    return this.getCelda(row, col) === 2;
  }

  // Reinicia el tablero a su estado inicial
  reiniciar() {
    this.board = this.inicializarTablero();
  }
}

// Exportar la clase Tablero
export { Tablero };
