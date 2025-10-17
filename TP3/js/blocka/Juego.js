// Clase principal del Juego
class Juego {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ancho = canvas.width;
        this.alto = canvas.height;
        
        // Estados posibles
        this.MENU = 'menu';
        this.INSTRUCCIONES = 'instrucciones';
        this.JUGANDO = 'jugando';
        this.COMPLETADO = 'completado';
        this.PERDIDO = 'perdido';
        
        this.estadoActual = this.MENU;
        
        // Componentes
        this.cargadorImagenes = new CargadorImagenes();
        this.menu = new MenuPrincipal(this.ancho, this.alto);
        this.pantallaInstrucciones = new PantallaInstrucciones(this.ancho, this.alto);
        this.temporizador = new Temporizador(30); // 30 segundos por nivel
        this.puzzle = null;
        
        // Niveles
        this.nivelActual = 1;
        this.nivelMaximo = 10;
        this.tamañoCuadricula = 2;
        
        // Tiempo al completar nivel
        this.tiempoAlCompletar = '';
        
        // Botones de pantalla completada
        this.botonesCompletado = [];
        this.crearBotonesCompletado();
        
        // Botones de pantalla perdido
        this.botonesPerdido = [];
        this.crearBotonesPerdido();
        
        // Configurar eventos
        this.configurarEventos();
        
        // Cargar imágenes
        this.cargarImagenes();
    }

    cargarImagenes() {
        // Llamar a cargar y pasarle una función que se ejecutará cuando termine
        this.cargadorImagenes.cargarTodas(() => {
            // Las imágenes ya están cargadas, el juego puede continuar
            this.bucleJuego();
        });
    }

    configurarEventos() {
        // Click izquierdo
        this.canvas.addEventListener('click', (e) => {
            this.manejarClick(e);
        });
        
        // Click derecho
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.manejarClickDerecho(e);
        });
        
        // Movimiento del mouse
        this.canvas.addEventListener('mousemove', (e) => {
            this.manejarMovimientoMouse(e);
        });
    }

    obtenerPosicionMouse(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    manejarClick(e) {
        const pos = this.obtenerPosicionMouse(e);
        
        if (this.estadoActual === this.MENU) {
            const accion = this.menu.manejarClick(pos.x, pos.y);
            if (accion === 'comenzar') {
                this.comenzarJuego();
            } else if (accion === 'instrucciones') {
                this.estadoActual = this.INSTRUCCIONES;
            }
        } else if (this.estadoActual === this.INSTRUCCIONES) {
            if (this.pantallaInstrucciones.manejarClick(pos.x, pos.y)) {
                this.estadoActual = this.MENU;
            }
        } else if (this.estadoActual === this.JUGANDO) {
            const pieza = this.puzzle.obtenerPiezaEn(pos.x, pos.y);
            if (pieza) {
                pieza.rotarIzquierda();
                this.verificarCompletado();
            }
        } else if (this.estadoActual === this.COMPLETADO) {
            this.manejarClickCompletado(pos.x, pos.y);
        } else if (this.estadoActual === this.PERDIDO) {
            this.manejarClickPerdido(pos.x, pos.y);
        }
    }

    manejarClickDerecho(e) {
        const pos = this.obtenerPosicionMouse(e);
        
        if (this.estadoActual === this.JUGANDO) {
            const pieza = this.puzzle.obtenerPiezaEn(pos.x, pos.y);
            if (pieza) {
                pieza.rotarDerecha();
                this.verificarCompletado();
            }
        }
    }

    manejarMovimientoMouse(e) {
        const pos = this.obtenerPosicionMouse(e);
        
        if (this.estadoActual === this.MENU) {
            // Detecta si el mouse está sobre algún botón del menú
            this.menu.manejarMovimientoMouse(pos.x, pos.y);
        } else if (this.estadoActual === this.INSTRUCCIONES) {
            // Detecta si el mouse está sobre el botón "Volver"
            this.pantallaInstrucciones.manejarMovimientoMouse(pos.x, pos.y);
        } else if (this.estadoActual === this.COMPLETADO) {
            // Detecta si el mouse está sobre los botones "Menú" o "Siguiente"
            this.actualizarHoverBotonesCompletado(pos.x, pos.y);
        } else if (this.estadoActual === this.PERDIDO) {
            // Detecta si el mouse está sobre los botones de pantalla perdido
            this.actualizarHoverBotonesPerdido(pos.x, pos.y);
        }
    }

    comenzarJuego() {
        this.nivelActual = 1;
        this.tamañoCuadricula = this.menu.obtenerTamañoCuadricula();
        this.iniciarNivel();
    }

    iniciarNivel() {
        const imagenAleatoria = this.cargadorImagenes.obtenerImagenAleatoria();
        this.puzzle = new Puzzle(imagenAleatoria, this.tamañoCuadricula, this.nivelActual, this.ancho, this.alto);
        this.temporizador.reiniciar();
        this.temporizador.iniciar();
        this.estadoActual = this.JUGANDO;
    }

    verificarCompletado() {
        if (this.puzzle.verificarCompletado()) {
            // Guardar el tiempo transcurrido ANTES de detener el temporizador
            this.tiempoAlCompletar = this.temporizador.obtenerTiempoTranscurrido();
            this.temporizador.detener();
            this.estadoActual = this.COMPLETADO;
        }
    }

    verificarTiempo() {
        // Verificar si se acabó el tiempo
        if (this.temporizador.seAcaboElTiempo()) {
            this.temporizador.detener();
            this.estadoActual = this.PERDIDO;
        }
    }

    crearBotonesCompletado() {
        const anchoBton = 200;
        const altoBton = 50;
        const centroX = this.ancho / 2;
        const posY = this.alto - 100;
        
        this.botonesCompletado = [
            {
                id: 'menu',
                x: centroX - anchoBton - 20,
                y: posY,
                ancho: anchoBton,
                alto: altoBton,
                texto: 'Menú Principal',
                color: '#2196F3',
                colorHover: '#0b7dda',
                hover: false
            },
            {
                id: 'siguiente',
                x: centroX + 20,
                y: posY,
                ancho: anchoBton,
                alto: altoBton,
                texto: 'Siguiente Nivel',
                color: '#4CAF50',
                colorHover: '#45a049',
                hover: false
            }
        ];
    }

    crearBotonesPerdido() {
        const anchoBton = 200;
        const altoBton = 50;
        const centroX = this.ancho / 2;
        const posY = this.alto - 100;
        
        this.botonesPerdido = [
            {
                id: 'menu',
                x: centroX - anchoBton - 20,
                y: posY,
                ancho: anchoBton,
                alto: altoBton,
                texto: 'Menú Principal',
                color: '#2196F3',
                colorHover: '#0b7dda',
                hover: false
            },
            {
                id: 'reintentar',
                x: centroX + 20,
                y: posY,
                ancho: anchoBton,
                alto: altoBton,
                texto: 'Reintentar',
                color: '#FF9800',
                colorHover: '#e68900',
                hover: false
            }
        ];
    }

    actualizarHoverBotonesCompletado(x, y) {
        for (let i = 0; i < this.botonesCompletado.length; i++) {
            const btn = this.botonesCompletado[i];
            btn.hover = (x >= btn.x && x <= btn.x + btn.ancho &&
                        y >= btn.y && y <= btn.y + btn.alto);
        }
    }

    manejarClickCompletado(x, y) {
        for (let i = 0; i < this.botonesCompletado.length; i++) {
            const btn = this.botonesCompletado[i];
            if (x >= btn.x && x <= btn.x + btn.ancho &&
                y >= btn.y && y <= btn.y + btn.alto) {
                
                if (btn.id === 'menu') {
                    this.estadoActual = this.MENU;
                } else if (btn.id === 'siguiente') {
                    this.nivelActual++;
                    if (this.nivelActual > this.nivelMaximo) {
                        this.nivelActual = 1;
                    }
                    this.iniciarNivel();
                }
                break;
            }
        }
    }

    actualizarHoverBotonesPerdido(x, y) {
        for (let i = 0; i < this.botonesPerdido.length; i++) {
            const btn = this.botonesPerdido[i];
            btn.hover = (x >= btn.x && x <= btn.x + btn.ancho &&
                        y >= btn.y && y <= btn.y + btn.alto);
        }
    }

    manejarClickPerdido(x, y) {
        for (let i = 0; i < this.botonesPerdido.length; i++) {
            const btn = this.botonesPerdido[i];
            if (x >= btn.x && x <= btn.x + btn.ancho &&
                y >= btn.y && y <= btn.y + btn.alto) {
                
                if (btn.id === 'menu') {
                    this.estadoActual = this.MENU;
                } else if (btn.id === 'reintentar') {
                    this.iniciarNivel();
                }
                break;
            }
        }
    }

    bucleJuego() {
        // Crear un bucle que se ejecuta cada 16 milisegundos (aproximadamente 60 veces por segundo)
        const self = this;
        setInterval(function() {
            self.dibujar();
        }, 16);
    }

    dibujar() {
        // Limpiar canvas
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.ancho, this.alto);
        
        if (this.estadoActual === this.MENU) {
            this.menu.dibujar(this.ctx);
        } else if (this.estadoActual === this.INSTRUCCIONES) {
            this.pantallaInstrucciones.dibujar(this.ctx);
        } else if (this.estadoActual === this.JUGANDO) {
            this.verificarTiempo();
            this.dibujarJugando();
        } else if (this.estadoActual === this.COMPLETADO) {
            this.dibujarCompletado();
        } else if (this.estadoActual === this.PERDIDO) {
            this.dibujarPerdido();
        }
    }

    dibujarJugando() {
        // Fondo
        this.ctx.fillStyle = '#e8e8e8';
        this.ctx.fillRect(0, 0, this.ancho, this.alto);
        
        // Nivel
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Nivel ' + this.nivelActual, 20, 40);
        
        // Timer
        this.temporizador.dibujar(this.ctx, this.ancho / 2, 40);
        
        // Instrucción
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillStyle = '#666';
        this.ctx.fillText('Click Izq: ↶ | Click Der: ↷', this.ancho - 20, 40);
        
        // Puzzle
        if (this.puzzle) {
            this.puzzle.dibujar(this.ctx);
        }
    }

    dibujarCompletado() {
        // Fondo
        this.ctx.fillStyle = '#e8e8e8';
        this.ctx.fillRect(0, 0, this.ancho, this.alto);
        
        // Puzzle completado
        if (this.puzzle) {
            this.puzzle.dibujar(this.ctx);
        }
        
        // Mensaje
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 56px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 10;
        this.ctx.fillText('¡COMPLETADO!', this.ancho / 2, this.alto / 2 - 80);
        
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        
        // Tiempo - Mostrar el tiempo que tardó en completar el nivel
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.fillText('Tiempo: ' + this.tiempoAlCompletar, this.ancho / 2, this.alto / 2 - 10);
        
        // Nivel
        this.ctx.font = '28px Arial';
        this.ctx.fillText('Nivel ' + this.nivelActual + ' completado', this.ancho / 2, this.alto / 2 + 40);
        
        // Botones
        for (let i = 0; i < this.botonesCompletado.length; i++) {
            const btn = this.botonesCompletado[i];
            let color;
            if (btn.hover) {
                color = btn.colorHover;
            } else {
                color = btn.color;
            }
            
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            this.ctx.shadowBlur = 10;
            
            this.ctx.fillStyle = color;
            this.ctx.fillRect(btn.x, btn.y, btn.ancho, btn.alto);
            
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
            
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(btn.x, btn.y, btn.ancho, btn.alto);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.fillText(btn.texto, btn.x + btn.ancho / 2, btn.y + btn.alto / 2 + 2);
        }
    }

    dibujarPerdido() {
        // Fondo
        this.ctx.fillStyle = '#e8e8e8';
        this.ctx.fillRect(0, 0, this.ancho, this.alto);
        
        // Puzzle sin completar
        if (this.puzzle) {
            this.puzzle.dibujar(this.ctx);
        }
        
        // Mensaje principal
        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = 'bold 56px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 10;
        this.ctx.fillText('¡SE ACABÓ EL TIEMPO!', this.ancho / 2, this.alto / 2 - 80);
        
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        
        // Mensaje secundario
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.fillText('¡Perdiste!', this.ancho / 2, this.alto / 2 - 10);
        
        // Nivel
        this.ctx.font = '28px Arial';
        this.ctx.fillText('Nivel ' + this.nivelActual, this.ancho / 2, this.alto / 2 + 40);
        
        // Botones
        for (let i = 0; i < this.botonesPerdido.length; i++) {
            const btn = this.botonesPerdido[i];
            let color;
            if (btn.hover) {
                color = btn.colorHover;
            } else {
                color = btn.color;
            }
            
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            this.ctx.shadowBlur = 10;
            
            this.ctx.fillStyle = color;
            this.ctx.fillRect(btn.x, btn.y, btn.ancho, btn.alto);
            
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
            
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(btn.x, btn.y, btn.ancho, btn.alto);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.fillText(btn.texto, btn.x + btn.ancho / 2, btn.y + btn.alto / 2 + 2);
        }
    }
}
