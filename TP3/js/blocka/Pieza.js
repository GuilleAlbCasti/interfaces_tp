// Clase que representa una pieza del puzzle
class Pieza {
    constructor(imagenCompleta, x, y, ancho, alto, origenX, origenY, anchoOrigen, altoOrigen, indice, nivel) {
        this.imagenCompleta = imagenCompleta;
        this.x = x;
        this.y = y;
        this.ancho = ancho;
        this.alto = alto;
        this.origenX = origenX;
        this.origenY = origenY;
        this.anchoOrigen = anchoOrigen;
        this.altoOrigen = altoOrigen;
        this.indice = indice;
        this.nivel = nivel;
        
        this.rotacionActual = 0;
        this.rotacionCorrecta = 0;
        
        // Rotación inicial aleatoria
        const rotaciones = [0, 90, 180, 270];
        this.rotacionActual = rotaciones[Math.floor(Math.random() * rotaciones.length)];
    }

    rotarIzquierda() {
        this.rotacionActual -= 90;
        if (this.rotacionActual < 0 ) {
            this.rotacionActual = 270;
        }
    }

    rotarDerecha() {
        this.rotacionActual += 90;
        if (this.rotacionActual >= 360) {
            this.rotacionActual = 0;
        }
    }

    estaCorrecta() {
        return this.rotacionActual === this.rotacionCorrecta;
    }

    contienePunto(mouseX, mouseY) {
        return mouseX >= this.x && mouseX <= this.x + this.ancho &&
               mouseY >= this.y && mouseY <= this.y + this.alto;
    }

    dibujar(ctx, mostrarOriginal) {
        ctx.save();
        
        // Trasladar al centro para rotar
        ctx.translate(this.x + this.ancho / 2, this.y + this.alto / 2);
        ctx.rotate((this.rotacionActual * Math.PI) / 180);
        
        // Dibujar la porción de la imagen
        ctx.drawImage(
            this.imagenCompleta,
            this.origenX, this.origenY, this.anchoOrigen, this.altoOrigen,
            -this.ancho / 2, -this.alto / 2, this.ancho, this.alto
        );
        
        ctx.restore();
        
        // Aplicar filtro si no está completado
        if (!mostrarOriginal) {
            // Obtener los píxeles de la pieza
            const datosImagen = ctx.getImageData(this.x, this.y, this.ancho, this.alto);
            
            // Aplicar filtro según el nivel
            const datosConFiltro = GestorFiltros.aplicarFiltroPorNivel(datosImagen, this.nivel);
            
            // Volver a dibujar con el filtro aplicado
            ctx.putImageData(datosConFiltro, this.x, this.y);
        }
        
        // Dibujar borde
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.ancho, this.alto);
    }
}
