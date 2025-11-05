
// maneja las reglas del juego y coordina con el Tablero

import { Tablero } from "./tablero.js";

class Model {
  constructor() {
    // Instancia del tablero
    this.tablero = new Tablero();

    // Contador de movimientos realizados
    this.moves = 0;

    // Ficha seleccionada actualmente (null si no hay ninguna seleccionada)
    this.selectedPeg = null;
  }

  // Obtiene el estado actual del tablero
  obtenerTablero() {
    return this.tablero.obtenerTablero();
  }

  // Obtiene el número de movimientos realizados
  obtenerMovimientos() {
    return this.moves;
  }

  // Cuenta cuántas fichas quedan en el tablero
  contarFichas() {
    return this.tablero.contarFichas();
  }

  // Selecciona una ficha en la posición 
  seleccionarFicha(row, col) {
    // Solo se puede seleccionar si hay una ficha en esa posición
    if (this.tablero.tieneFicha(row, col)) {
      this.selectedPeg = { row, col };
      return true;
    }
    return false;
  }

  // Deselecciona la ficha actual
  deseleccionarFicha() {
    this.selectedPeg = null;
  }

  // Obtiene la ficha seleccionada actualmente
  obtenerFichaSeleccionada() {
    return this.selectedPeg;
  }

  // Verifica si un movimiento es válido
  // Un movimiento es válido si:
  // 1. Hay una ficha seleccionada
  // 2. El destino está vacío
  // 3. Hay una ficha adyacente entre el origen y el destino
  // 4. El movimiento es horizontal o vertical (no diagonal)
  esMovimientoValido(targetRow, targetCol) {
    if (!this.selectedPeg) return false;

    // Extrae las propiedades row y col del objeto this.selectedPeg
    // y asigna los valores a fromRow y fromCol
    const { row: fromRow, col: fromCol } = this.selectedPeg;

    // El destino debe estar vacío
    if (!this.tablero.estaVacio(targetRow, targetCol)) return false;

    // Calcular la diferencia entre origen y destino
    const rowDiff = targetRow - fromRow;
    const colDiff = targetCol - fromCol;

    // El movimiento debe ser exactamente 2 posiciones (saltar sobre una ficha)
    // Movimiento horizontal (misma fila, 2 columnas de diferencia)
    if (rowDiff === 0 && Math.abs(colDiff) === 2) {
      const middleCol = fromCol + colDiff / 2;
      // Debe haber una ficha en el medio
      return this.tablero.tieneFicha(fromRow, middleCol);
    }

    // Movimiento vertical (misma columna, 2 filas de diferencia)
    if (colDiff === 0 && Math.abs(rowDiff) === 2) {
      const middleRow = fromRow + rowDiff / 2;
      // Debe haber una ficha en el medio
      return this.tablero.tieneFicha(middleRow, fromCol);
    }
    return false;
  }

  // Mueve la ficha seleccionada al destino y elimina la ficha saltada
  realizarMovimiento(targetRow, targetCol) {
    if (!this.esMovimientoValido(targetRow, targetCol)) return false;

    const { row: fromRow, col: fromCol } = this.selectedPeg;

    // Calcular la posición de la ficha que se va a saltar
    const rowDiff = targetRow - fromRow;
    const colDiff = targetCol - fromCol;
    const middleRow = fromRow + rowDiff / 2;
    const middleCol = fromCol + colDiff / 2;

    // Realizar el movimiento:
    // 1. Quitar la ficha del origen
    this.tablero.setCelda(fromRow, fromCol, 2);

    // 2. Eliminar la ficha saltada
    this.tablero.setCelda(middleRow, middleCol, 2);

    // 3. Colocar la ficha en el destino
    this.tablero.setCelda(targetRow, targetCol, 1);

    // Incrementar contador de movimientos
    this.moves++;

    // Deseleccionar la ficha
    this.deseleccionarFicha();

    return true;
  }

  // Obtiene todos los movimientos válidos posibles desde la ficha seleccionada
  obtenerMovimientosValidos() {
    // Si no hay ficha seleccionada, retornar lista vacía
    if (!this.selectedPeg) return [];

    const validMoves = [];
    const { row, col } = this.selectedPeg;

    // Las fichas solo pueden moverse 2 espacios (saltando 1 ficha)
    // en 4 direcciones: arriba, abajo, izquierda, derecha
    
    // ARRIBA: 2 filas hacia arriba (row - 2)
    const arribaRow = row - 2;
    const arribaCol = col;
    if (this.esMovimientoValido(arribaRow, arribaCol)) {
      validMoves.push({ row: arribaRow, col: arribaCol })
    }

    // ABAJO: 2 filas hacia abajo (row + 2)
    const abajoRow = row + 2;
    const abajoCol = col;
    if (this.esMovimientoValido(abajoRow, abajoCol)) {
      validMoves.push({ row: abajoRow, col: abajoCol })
    }

    // IZQUIERDA: 2 columnas a la izquierda (col - 2)
    const izquierdaRow = row;
    const izquierdaCol = col - 2;
    if (this.esMovimientoValido(izquierdaRow, izquierdaCol)) {
      validMoves.push({ row: izquierdaRow, col: izquierdaCol })
    }

    // DERECHA: 2 columnas a la derecha (col + 2)
    const derechaRow = row;
    const derechaCol = col + 2;
    if (this.esMovimientoValido(derechaRow, derechaCol)) {
      validMoves.push({ row: derechaRow, col: derechaCol })
    }

    return validMoves;
  }

  // Verifica si hay algún movimiento válido posible en todo el tablero
  // Retorna true si encuentra AL MENOS UN movimiento posible
  tieneMovimientosValidos() {
    // Recorrer TODO el tablero
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        
        // Si encontramos una ficha, verificar si puede moverse
        if (this.tablero.tieneFicha(row, col)) {          
          // Verificar las 4 direcciones posibles
          // Para moverse necesita: ficha adyacente + espacio vacío detrás
          // arriba
          const fichaMedioArriba = this.tablero.tieneFicha(row - 1, col);
          const espacioVacioArriba = this.tablero.estaVacio(row - 2, col);
          if (fichaMedioArriba && espacioVacioArriba) {
            return true;  // ✅ Encontramos un movimiento válido
          }
          
          // abajo
          const fichaMedioAbajo = this.tablero.tieneFicha(row + 1, col);
          const espacioVacioAbajo = this.tablero.estaVacio(row + 2, col);
          if (fichaMedioAbajo && espacioVacioAbajo) {
            return true;  // ✅ Encontramos un movimiento válido
          }
          
          // izquierda
          const fichaMedioIzquierda = this.tablero.tieneFicha(row, col - 1);
          const espacioVacioIzquierda = this.tablero.estaVacio(row, col - 2);
          if (fichaMedioIzquierda && espacioVacioIzquierda) {
            return true;  // ✅ Encontramos un movimiento válido
          }
          
          // derecha
          const fichaMedioDerecha = this.tablero.tieneFicha(row, col + 1);
          const espacioVacioDerecha = this.tablero.estaVacio(row, col + 2);
          if (fichaMedioDerecha && espacioVacioDerecha) {
            return true;  // movimiento válido
          }
        }
      }
    }
    
    return false;  // No hay más jugadas posibles (FIN)
  
  }

  // Verifica si el juego ha terminado (solo queda 1 ficha en el centro)
  juegoGanado() {
    // Debe quedar exactamente 1 ficha
    if (this.contarFichas() !== 1) return false;
    
    // La ficha debe estar en el centro del tablero (fila 3, columna 3)
    return this.tablero.tieneFicha(3, 3);
  }

  // Verifica si el juego ha terminado (ganó o no hay más movimientos)
  juegoTerminado() {
    // El juego termina si ganó O si no hay más movimientos posibles
    return this.juegoGanado() || !this.tieneMovimientosValidos();
  }

  // Reinicia el juego al estado inicial
  reiniciar() {
    this.tablero.reiniciar();
    this.moves = 0;
    this.selectedPeg = null;
  }
}

// Exportar la clase Model
export { Model };
