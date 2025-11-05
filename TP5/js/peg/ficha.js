

const imagenesFichas = [];
const imagenesCargadas = false;

// Cargar las 3 imágenes (Peg_1.jpg, Peg_2.jpg, Peg_3.jpg)
for (let i = 1; i <= 3; i++) {
  const img = new Image();
  img.src = `../img/Peg_${i}.jpg`;
  imagenesFichas.push(img);
}

class FichaPeg {
  constructor(row, col) {
    // Posición de la ficha en el tablero
    this.row = row;
    this.col = col;
    
    // Estado de selección
    this.isSelected = false;

    // Asignar una imagen aleatoria    
    const indiceAleatorio = Math.floor(Math.random() * 3);
    this.imagen = imagenesFichas[indiceAleatorio];
  }

  // Obtiene la posición de la ficha como objeto
  obtenerPosicion() {
    return { row: this.row, col: this.col };
  }

  // Selecciona la ficha
  seleccionar() {
    this.isSelected = true;
  }

  // Deselecciona la ficha
  deseleccionar() {
    this.isSelected = false;
  }

  // Verifica si la ficha está en una posición específica
  estaEn(row, col) {
    return this.row === row && this.col === col;
  }

  // Mueve la ficha a una nueva posición
  moverA(newRow, newCol) {
    this.row = newRow;
    this.col = newCol;
  }

  // Dibuja la ficha en el canvas usando la imagen asignada
  dibujar(ctx, x, y, radius, colors) {
    
    // La imagen será un cuadrado que cabe dentro del círculo
    const tamañoImagen = radius * 2;

    //  Dibujar la sombra  si está seleccionada
    if (this.isSelected) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.arc(x + 3, y + 3, radius, 0, Math.PI * 2);
      ctx.fill();
    }
   
    ctx.save();
    
    // Esto hace que la imagen solo se vea dentro del círculo
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.clip();   // Todo lo que dibujemos ahora solo se verá dentro del círculo
   
    // Centramos la imagen restando la mitad del tamaño
    ctx.drawImage(
      this.imagen,
      x - radius,           // Posición X (centrada)
      y - radius,           // Posición Y (centrada)
      tamañoImagen,         // Ancho
      tamañoImagen          // Alto
    )

    // Restaurar el canvas (quitar el clip)
    ctx.restore();

    //Si está seleccionada, dibujar un borde  brillante
    if (this.isSelected) {
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 4;
      ctx.shadowColor = "#FFD700";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
      ctx.stroke();
      // Resetear la sombra
      ctx.shadowBlur = 0;
    }
  }

  // Crea una copia de la ficha (incluyendo su imagen)
  clonar() {
    const newFicha = new FichaPeg(this.row, this.col);
    newFicha.isSelected = this.isSelected;
    newFicha.imagen = this.imagen;   
  }
}

// Exportar la clase FichaPeg
export { FichaPeg };
