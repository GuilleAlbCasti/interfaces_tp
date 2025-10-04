
// FUNCIÓN PARA MOSTRAR EL FOOTER
document.addEventListener('DOMContentLoaded', function() {
    fetch('/TP2/html/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('funcion_footer').innerHTML = data;
        });
});
