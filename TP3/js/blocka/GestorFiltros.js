// Clase para aplicar filtros a las imágenes
class GestorFiltros {
    
    static aplicarEscalaGrises(imageData) {
        const datos = imageData.data;
        for (let i = 0; i < datos.length; i += 4) {
            const gris = 0.299 * datos[i] + 0.587 * datos[i + 1] + 0.114 * datos[i + 2];
            datos[i] = gris;
            datos[i + 1] = gris;
            datos[i + 2] = gris;
        }
        return imageData;
    }

    static aplicarBrillo(imageData) {
        const datos = imageData.data;
        const factor = 1.3; // 30% más brillo
        
        for (let i = 0; i < datos.length; i += 4) {
            datos[i] = Math.min(255, datos[i] * factor);
            datos[i + 1] = Math.min(255, datos[i + 1] * factor);
            datos[i + 2] = Math.min(255, datos[i + 2] * factor);
        }
        return imageData;
    }

    static aplicarNegativo(imageData) {
        const datos = imageData.data;
        for (let i = 0; i < datos.length; i += 4) {
            datos[i] = 255 - datos[i];
            datos[i + 1] = 255 - datos[i + 1];
            datos[i + 2] = 255 - datos[i + 2];
        }
        return imageData;
    }

    static aplicarFiltroPorNivel(imageData, nivel) {
        const filtros = ['grises', 'brillo', 'negativo'];
        const tipoFiltro = filtros[(nivel - 1) % 3];
        
        if (tipoFiltro === 'grises') {
            return this.aplicarEscalaGrises(imageData);
        } else if (tipoFiltro === 'brillo') {
            return this.aplicarBrillo(imageData);
        } else if (tipoFiltro === 'negativo') {
            return this.aplicarNegativo(imageData);
        } else {
            return imageData;
        }
    }
}
