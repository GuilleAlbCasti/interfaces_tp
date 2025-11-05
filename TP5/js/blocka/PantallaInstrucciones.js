// Pantalla de Instrucciones
class PantallaInstrucciones {
    constructor(anchoCanvas, altoCanvas) {
        this.anchoCanvas = anchoCanvas;
        this.altoCanvas = altoCanvas;
        this.botonVolver = {
            x: anchoCanvas / 2 - 100,
            y: altoCanvas - 100,
            ancho: 200,
            alto: 50,
            texto: 'Volver al Menú',
            color: '#2196F3',
            colorHover: '#0b7dda',
            hover: false
        };
    }

    manejarClick(x, y) {
        const btn = this.botonVolver;
        if (x >= btn.x && x <= btn.x + btn.ancho &&
            y >= btn.y && y <= btn.y + btn.alto) {
            return true;
        }
        return false;
    }

    manejarMovimientoMouse(x, y) {
        const btn = this.botonVolver;
        btn.hover = (x >= btn.x && x <= btn.x + btn.ancho &&
                    y >= btn.y && y <= btn.y + btn.alto);
    }

    dibujar(ctx) {
        // Fondo
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, this.anchoCanvas, this.altoCanvas);

        // Título
        ctx.fillStyle = '#333';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Instrucciones', this.anchoCanvas / 2, 70);

        // Instrucciones
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#555';
        
        let y = 150;
        const margen = 150;
        
        // Cómo jugar
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#2196F3';
        ctx.textAlign = 'center';
        ctx.fillText('¿Cómo jugar?', this.anchoCanvas / 2, y);
        y += 40;
        
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#555';
        
        ctx.fillText('• La imagen se divide en varias piezas rotadas aleatoriamente', margen, y);
        y += 30;
        ctx.fillText('• Haz CLICK IZQUIERDO en una pieza para rotarla hacia la izquierda', margen, y);
        y += 30;
        ctx.fillText('• Haz CLICK DERECHO en una pieza para rotarla hacia la derecha', margen, y);
        y += 30;
        ctx.fillText('• Rota todas las piezas hasta formar la imagen correcta', margen, y);
        y += 30;
        ctx.fillText('• Cuando completes el puzzle, se mostrará la imagen original', margen, y);
        y += 50;
        
        // Objetivo
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#2196F3';
        ctx.textAlign = 'center';
        ctx.fillText('Objetivo:', this.anchoCanvas / 2, y);
        y += 40;
        
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#555';
        
        ctx.fillText('• Completa el puzzle en el menor tiempo posible', margen, y);
        y += 30;
        ctx.fillText('• Cada nivel tiene una imagen diferente y filtros aplicados', margen, y);
        y += 30;
        ctx.fillText('• Los filtros desaparecen cuando completes el nivel', margen, y);
        y += 50;
        
        // Configuración
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#2196F3';
        ctx.textAlign = 'center';
        ctx.fillText('Configuración:', this.anchoCanvas / 2, y);
        y += 40;
        
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#555';
        
        ctx.fillText('• Puedes elegir jugar con 4, 6 u 8 piezas', margen, y);
        y += 30;
        ctx.fillText('• Más piezas = Mayor dificultad', margen, y);

        // Botón volver
        const btn = this.botonVolver;
        let color;
        if (btn.hover) {
            color = btn.colorHover;
        } else {
            color = btn.color;
        }
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
        
        ctx.fillStyle = color;
        ctx.fillRect(btn.x, btn.y, btn.ancho, btn.alto);
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(btn.x, btn.y, btn.ancho, btn.alto);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(btn.texto, btn.x + btn.ancho / 2, btn.y + btn.alto / 2 + 2);
    }
}
