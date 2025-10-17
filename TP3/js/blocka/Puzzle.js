// Clase que representa el puzzle completo
class Puzzle {
    constructor(imagen, tamañoCuadricula, nivel, anchoCanvas, altoCanvas) {
        this.imagen = imagen;
        this.tamañoCuadricula = tamañoCuadricula;
        this.nivel = nivel;
        this.anchoCanvas = anchoCanvas;
        this.altoCanvas = altoCanvas;
        this.piezas = [];
        this.completo = false;
        
        this.inicializar();
    }

    inicializar() {
        // Tamaño del puzzle en el canvas
        const tamañoPuzzle = Math.min(this.anchoCanvas * 0.7, this.altoCanvas * 0.8);
        const posX = (this.anchoCanvas - tamañoPuzzle) / 2;
        const posY = (this.altoCanvas - tamañoPuzzle) / 2 + 30;
        
        // Determinar filas y columnas
        let filas, columnas;
        if (this.tamañoCuadricula === 2) {
            filas = 2;
            columnas = 2;
        } else if (this.tamañoCuadricula === 3) {
            filas = 2;
            columnas = 3;
        } else if (this.tamañoCuadricula === 4) {
            filas = 2;
            columnas = 4;
        } else {
            filas = 2;
            columnas = 2;
        }
        
        const anchoPieza = tamañoPuzzle / columnas;
        const altoPieza = tamañoPuzzle / filas;
        
        // Hacer la imagen cuadrada (recortar al centro)
        const anchoImagen = this.imagen.width;
        const altoImagen = this.imagen.height;
        const ladoMinimo = Math.min(anchoImagen, altoImagen);
        
        const offsetOrigenX = (anchoImagen - ladoMinimo) / 2;
        const offsetOrigenY = (altoImagen - ladoMinimo) / 2;
        
        const anchoOrigenPieza = ladoMinimo / columnas;
        const altoOrigenPieza = ladoMinimo / filas;
        
        // Crear las piezas
        let indice = 0;
        for (let fila = 0; fila < filas; fila++) {
            for (let col = 0; col < columnas; col++) {
                const x = posX + col * anchoPieza;
                const y = posY + fila * altoPieza;
                const origenX = offsetOrigenX + col * anchoOrigenPieza;
                const origenY = offsetOrigenY + fila * altoOrigenPieza;
                
                const pieza = new Pieza(
                    this.imagen,
                    x, y,
                    anchoPieza, altoPieza,
                    origenX, origenY,
                    anchoOrigenPieza, altoOrigenPieza,
                    indice,
                    this.nivel
                );
                
                this.piezas.push(pieza);
                indice++;
            }
        }
    }
    //verifica que todas las piezas esten en su posicion correcta (rotacion correcta = 0`)
    verificarCompletado() {
        let todasCorrectas = true;
        for (let i = 0; i < this.piezas.length; i++) {
            if (!this.piezas[i].estaCorrecta()) {
                todasCorrectas = false;
                break;
            }
        }
        this.completo = todasCorrectas;
        return this.completo;
    }

    obtenerPiezaEn(x, y) {
        for (let i = this.piezas.length - 1; i >= 0; i--) {
            if (this.piezas[i].contienePunto(x, y)) {
                return this.piezas[i];
            }
        }
        return null;
    }

    dibujar(ctx) {
        for (let i = 0; i < this.piezas.length; i++) {
            this.piezas[i].dibujar(ctx, this.completo);
        }
    }
}
