// Clase para cargar las imágenes del juego
class CargadorImagenes {
    constructor() {
        this.imagenes = [];
        this.nombresImagenes = [
            'bill Gates.jpg',
            'elon musk.jpg',
            'jeff bezos.jpg',
            'jensen huang.jpg',
            'linus torvalds.jpg',
            'steve jobs.jpg'
        ];
        this.todasCargadas = false;
        this.funcionCuandoTermine = null;
        this.cuantasCargadas = 0;
    }

    cargarTodas(funcionCuandoTermine) {
        // Guardar la función para llamarla después
        this.funcionCuandoTermine = funcionCuandoTermine;
        
        // Si ya están cargadas, ejecutar la función
        if (this.todasCargadas) {
            this.funcionCuandoTermine();
            return;
        }

        // Empezar a contar desde 0
        this.cuantasCargadas = 0;

        // Cargar cada imagen
        for (let i = 0; i < this.nombresImagenes.length; i++) {
            const nombre = this.nombresImagenes[i];
            const img = new Image();
            
            // Cuando se cargue una imagen
            img.onload = () => {
                this.cuantasCargadas = this.cuantasCargadas + 1;
                
                // Si se cargaron todas
                if (this.cuantasCargadas === this.nombresImagenes.length) {
                    this.todasCargadas = true;
                    this.funcionCuandoTermine();
                }
            };
            
            // Empezar a cargar  -> img.src = '../../img/' + nombre;
            img.src = '../img/' + nombre;
            this.imagenes[i] = img;
        }
    }

    obtenerImagenAleatoria() {
        const indiceAleatorio = Math.floor(Math.random() * this.imagenes.length);
        return this.imagenes[indiceAleatorio];
    }
}
