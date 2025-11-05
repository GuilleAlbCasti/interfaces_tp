// MAIN - Punto de entrada de la aplicación
// Aquí se inicializan el Modelo, la Vista, el Timer y el Controlador

// Importar las clases Model, View, Timer y Controller
import { Model } from "../peg/model.js"
import { View } from "../peg/view.js"
import { Timer } from "../peg/Timer.js"
import { Controller } from "../peg/controller.js"

// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
 
  // Crear instancias de las clases MVC + Timer
  const model = new Model()
  const view = new View("game-canvas")
  const timer = new Timer()                      // NUEVO: Timer de 2 minutos
  const controller = new Controller(model, view, timer)  // Inyectar el timer

})
