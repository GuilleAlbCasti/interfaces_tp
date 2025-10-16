
  // Seleccionamos el span
  const porcentaje = document.querySelector('.porcentaje');
  let valor = 0;

  // Definimos duración total (4 segundos)
  const duracion = 4000;
  const intervalo = 50; // cada 50ms se actualiza
  const paso = 100 / (duracion / intervalo);

  // Iniciamos el contador
  const animacion = setInterval(() => {
    valor += paso;
    if (valor >= 100) {
      valor = 100;
      clearInterval(animacion); // detenemos la animación
    }
    porcentaje.textContent = Math.floor(valor) + "%"; // actualizamos el texto
  }, intervalo);
