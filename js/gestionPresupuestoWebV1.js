import * as jestionPresupuesto from "./gestionPresupuesto.js";
/* Importa **todo** lo exportado por el módulo "./gestionPresupuesto.js" y lo agrupa
 bajo el objeto `jestionPresupuesto`. */

let divTotal = document.getElementById("total");
// Busca en el DOM (document) el elemento cuyo id sea "total" y lo asigna a la variable `divTotal`.

divTotal.innerHTML = jestionPresupuesto.calcularTotalGastos();
/* Llama a la función `calcularTotalGastos` del módulo importado y asigna su valor
  como contenido HTML del elemento `divTotal`.
  ! se asume que `calcularTotalGastos()` devuelve una cadena o un número. */

let divForm = document.getElementById("formcreacion");
/* Busca en el DOM el elemento con id "formcreacion" y lo guarda en `divForm`.
  Este elemento será el contenedor se insertará dinámicamente el formulario. */

let form = document.createElement("form");
// Crea un elemento <form> nuevo en memoria. Todavía no está en el DOM.

let campoDesc = document.createElement("input");
// Crea un <input> para la descripción.

campoDesc.setAttribute("name", "descripcion");
/* Define el atributo name="descripcion" para que se pueda acceder al valor desde
  form.elements.descripcion cuando el formulario se envíe. */

campoDesc.setAttribute("id", "descripcion");
// Asigna id="descripcion" al input. Útil si quieres seleccionarlo por id más tarde.

let campoValor = document.createElement("input");
// Crea un <input> para el valor numérico del gasto.

campoValor.setAttribute("name", "valor");
// name="valor" para acceso fácil desde form.elements.

campoValor.setAttribute("type", "number");
// type="number" fuerza que el navegador ofrezca control numérico y validaciones básicas.

campoValor.setAttribute("id", "valor");
// id="valor" asignado al campo de valor.

let campoFecha = document.createElement("input");
// Crea un <input> para la fecha.

campoFecha.setAttribute("name", "fecha");
// name="fecha" para obtenerlo desde form.elements.

campoFecha.setAttribute("id", "fecha");
// id="fecha" asignado.

campoFecha.setAttribute("type", "date");
// type="date" hace que el navegador muestre un selector de fecha (si el navegador lo soporta).

let campoEtiquetas = document.createElement("input");
// Crea un <input> para las etiquetas (tags) asociadas al gasto.

campoEtiquetas.setAttribute("name", "etiquetas");
// name="etiquetas" para poder leer su valor en el envío del formulario.

campoEtiquetas.setAttribute("id", "etiquetas");
// id="etiquetas" asignado.

let botonEnvio = document.createElement("button");
// Crea un botón que usaremos para enviar el formulario.

botonEnvio.setAttribute("type", "submit");
// type="submit" hace que al pulsarlo se dispare el evento "submit" del <form>.

botonEnvio.textContent = "Crear";
// Texto visible en el botón: "Crear".

form.append(
  "Valor: ",
  campoValor,
  "Descripción: ",
  campoDesc,
  "Fecha: ",
  campoFecha,
  "Etiquetas: ",
  campoEtiquetas,
  botonEnvio
);
/* Añade al <form> los nodos y cadenas indicadas en ese orden.
  Las cadenas ("Valor: ", ...) se convierten en nodos de texto dentro del formulario.
  Al usar append así, el formulario se compone dinámicamente con etiquetas y campos. */

// # Manejador de eventos
form.addEventListener("submit", function (evento) {
  evento.preventDefault();
  /* Previene el comportamiento por defecto del formulario (recargar la página).
    A partir de aquí manejamos el envío con JavaScript. */

  let desc = evento.target.elements.descripcion.value;
  /* Extrae el valor del input con name="descripcion" desde el formulario (evento.target).
    `evento.target` es el <form> que disparó el submit. */

  let valor = parseFloat(evento.target.elements.valor.value);
  // Lee el valor del campo "valor" y lo transforma a número con parseFloat.

  let fecha = evento.target.elements.fecha.value;
  // Lee el valor del campo "fecha". Formato esperado: "YYYY-MM-DD" (input type date).

  let etiquetas = evento.target.elements.etiquetas.value.split(" ");
  /* Lee las etiquetas como una cadena y las separa por espacios creando un array de etiquetas.
    Ejemplo: "comida ocio" -> ["comida", "ocio"]. */

  console.log(etiquetas);
  // Muestra por consola el array de etiquetas (útil para depuración).

  let nuevoGasto = new jestionPresupuesto.CrearGasto(
    desc,
    valor,
    fecha,
    ...etiquetas
  );
  /* Crea una instancia de gasto llamando al constructor/export `CrearGasto` del módulo importado.
    Pasa como argumentos: descripción, valor, fecha, y luego **spread** de etiquetas (cada etiqueta como argumento separado).
    Esto asume que el constructor `CrearGasto` acepta esa firma (p. ej. (descripcion, valor, fecha, etiqueta1, etiqueta2, ...)). */

  jestionPresupuesto.anyadirGasto(nuevoGasto);
  /* Llama a la función `anyadirGasto` del módulo para añadir el nuevo gasto al almacenamiento interno
    (puede ser un array en memoria, localStorage, o una API — depende de la implementación del módulo). */

  pintarGastosWeb();
  // Llama a la función local `pintarGastosWeb()` para actualizar la interfaz con la lista actualizada.
});

divForm.append(form);
/* Inserta el formulario ya completo dentro del elemento contenedor `divForm` en el DOM.
  A partir de este momento el formulario es visible y funcional en la página. */

// Prototipo de manejador de eventos del botón de borrado
let ManejadorBorrado = {
  handleEvent: function (evento) {
    /* Define un objeto con método `handleEvent` — esto permite pasar el objeto directamente
      a addEventListener y que actúe como listener (el navegador llamará handleEvent). */

    if (confirm("¿Seguro que desea borrar?")) {
      // Muestra un diálogo modal de confirmación. Si el usuario pulsa "Aceptar" continua.

      jestionPresupuesto.borrarGasto(this.gasto.id);
      /* Llama a la función `borrarGasto` del módulo, usando `this.gasto.id`.
        `this` aquí será el objeto manejadorBorrar que deberá tener la propiedad `gasto`.
        Se asume que cada gasto tiene una propiedad `id` única que el módulo entiende. */

      pintarGastosWeb();
      // Actualiza la interfaz para reflejar que el gasto ha sido borrado.
    }
  },
};
/* `ManejadorBorrado` actúa como prototipo: más abajo se crean clones con `Object.create(ManejadorBorrado)`
  y a cada clone se le asigna la propiedad `gasto` correspondiente. */

// Elemento que contendrá la lista de gastos
let divLista = document.getElementById("listado");
/* Busca en el DOM el elemento con id "listado" y lo guarda en `divLista`.
  Será donde se renderice cada gasto. */

function pintarGastosWeb() {
  // Esta función encapsula la lógica de renderizado de la lista de gastos en la interfaz.

  divLista.innerHTML = "";
  // Limpia el contenido HTML previo para evitar duplicados al repintar.

  for (let gasto of jestionPresupuesto.listarGastos()) {
    /* Itera sobre la colección que devuelve `listarGastos()` desde el módulo importado.
      Se asume que `listarGastos()` devuelve un array de objetos gasto. */

    let gastoDiv = document.createElement("div");
    // Crea un contenedor <div> para cada gasto.

    gastoDiv.innerHTML = `${gasto.descripcion} - ${gasto.valor} - ${new Date(
      gasto.fecha
    ).toISOString()} - ${gasto.etiquetas}`;
    /* Rellena el <div> con texto que describe el gasto:
     - gasto.descripcion (cadena)
     - gasto.valor (número)
     - new Date(gasto.fecha).toISOString(): convierte la fecha a ISO string (UTC)
       NOTA: esto mostrará la fecha en formato UTC, con hora y minutos, por ej. "2025-11-02T00:00:00.000Z".
     - gasto.etiquetas: si es un array, se convertirá a string tipo "tag1,tag2"; si es otra estructura, se usará su toString(). */

    let gastoBorrar = document.createElement("button");
    gastoBorrar.setAttribute("type", "button");
    gastoBorrar.textContent = "Borrar";
    // Crea un botón para borrar el gasto sin enviar formularios (type="button").

    let manejadorBorrar = Object.create(ManejadorBorrado);
    // Crea un objeto cuyo prototype es `ManejadorBorrado`. Este objeto contiene el método handleEvent.

    manejadorBorrar.gasto = gasto;
    // Asigna la propiedad `gasto` al manejador, de modo que en `handleEvent` se pueda usar `this.gasto`.

    gastoBorrar.addEventListener("click", manejadorBorrar);
    /* Añade el manejador creado como listener al botón. Cuando se haga click,
      el navegador llamará manejadorBorrar.handleEvent(event) con `this` apuntando a `manejadorBorrar`. */

    gastoDiv.append(gastoBorrar);
    // Añade el botón de borrado al contenedor del gasto.

    divLista.append(gastoDiv);
    // Añade el contenedor del gasto a la lista principal en el DOM.
  }

  // Mostramos nuevo total
  divTotal.innerHTML = jestionPresupuesto.calcularTotalGastos();
  /* Actualiza el total visible llamando de nuevo a `calcularTotalGastos()` para reflejar
    cambios (altas o bajas). */
}

pintarGastosWeb();
/* Llama a `pintarGastosWeb()` una vez al cargar el script para mostrar la lista actual
  y el total inicial en la interfaz. */
