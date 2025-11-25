// ============================================================
// SISTEMA DE EXPLOSIÓN CON CANVAS
// ============================================================

// Variables globales que serán accesibles desde cualquier script
let explosion;
let explosionCtx;
let particulas = [];
let explosionActiva = false;

// Función para inicializar el canvas (llamada desde batParallax.js)
function inicializarExplosionCanvas() {
    explosion = document.getElementById('explosion');
    if (explosion) {
        explosionCtx = explosion.getContext('2d');
    } else {
        explosionCtx = null;
    }
    
    // Hacer las variables accesibles globalmente
    window.explosion = explosion;
    window.explosionCtx = explosionCtx;
       
    return { explosion, explosionCtx };
}

class Particula {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velocidadX = (Math.random() - 0.5) * 8;
        this.velocidadY = (Math.random() - 0.5) * 8;
        this.vida = 1.0;
        this.tamano = Math.random() * 4 + 2;
        this.color = this.generarColor();
    }
    
    generarColor() {
        const colores = [
            { r: 255, g: 100, b: 0 },   // Naranja
            { r: 255, g: 200, b: 0 },   // Amarillo
            { r: 255, g: 50, b: 0 },    // Rojo-naranja
            { r: 255, g: 255, b: 100 }  // Amarillo claro
        ];
        return colores[Math.floor(Math.random() * colores.length)];
    }
    
    actualizar() {
        this.x += this.velocidadX;
        this.y += this.velocidadY;
        this.velocidadX *= 0.95;
        this.velocidadY *= 0.95;
        this.vida -= 0.02;
        this.tamano *= 0.96;
    }
    
    dibujar(ctx) {
        ctx.save();
        ctx.globalAlpha = this.vida;
        
        // Gradiente radial para cada partícula
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.tamano);
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 1)`);
        gradient.addColorStop(0.5, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.5)`);
        gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.tamano, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function crearExplosion(x, y) {
      
    // Intentar usar las variables globales si las locales no están definidas
    const ctx = explosionCtx || window.explosionCtx;
    const canvas = explosion || window.explosion;
    
    
    if (!ctx || !canvas) {      
        // Intentar inicializar en el momento
        const result = inicializarExplosionCanvas();
        if (!result.explosionCtx) {
            console.error('No se pudo inicializar el canvas de explosión');
            return;
        }
        
        // Usar los valores recién inicializados
        explosionCtx = result.explosionCtx;
        explosion = result.explosion;
    }
    
    explosionActiva = true;
    particulas = [];
    
    // Crear 30 partículas desde el centro
    for (let i = 0; i < 30; i++) {
        particulas.push(new Particula(x, y));
    }
    
    // Mostrar canvas
    explosion.classList.add('active');
    
    // Animar explosión
    animarExplosion();
}

function animarExplosion() {
    if (!explosionActiva || !explosionCtx) return;
    
    // Limpiar canvas
    explosionCtx.clearRect(0, 0, 75, 75);
    
    // Actualizar y dibujar partículas
    for (let i = particulas.length - 1; i >= 0; i--) {
        particulas[i].actualizar();
        particulas[i].dibujar(explosionCtx);
        
        // Eliminar partículas muertas
        if (particulas[i].vida <= 0) {
            particulas.splice(i, 1);
        }
    }
    
    // Continuar animación si quedan partículas
    if (particulas.length > 0) {
        requestAnimationFrame(animarExplosion);
    } else {
        explosionActiva = false;
        explosion.classList.remove('active');
    }
}