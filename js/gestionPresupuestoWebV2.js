// js/gestionPresupuestoWebV2.js
// Módulo cliente web V2 para el "Gestor de gastos".
// Usa Web Components para representar cada gasto (<mi-gasto>) y reutiliza la lógica del módulo gestionPresupuesto.js

// -----------------------------
// 1) Importamos TODO lo exportado
// -----------------------------
import * as gestion from "./gestionPresupuesto.js";
/*
  Importa todas las exportaciones de gestionPresupuesto.js y las agrupa
  en el objeto `gestion`. Así podemos llamar, por ejemplo, a:
    gestion.anyadirGasto(...)
    gestion.listarGastos()
    gestion.CrearGasto(...)
    gestion.calcularTotalGastos()
  etc.
*/

// -----------------------------
// 2) Referencias a elementos del DOM
// -----------------------------
/* Capturamos los contenedores existentes en index.html donde vamos a
   insertar el formulario, el total y la lista. */
let divTotal = document.getElementById("total"); // mostrará el total actual
let divForm = document.getElementById("formcreacion"); // contendrá el formulario de creación
let divLista = document.getElementById("listado"); // contendrá la lista de <mi-gasto>

// -----------------------------
// 3) Definición del Web Component <mi-gasto>
// -----------------------------
/*
  Clase que implementa un componente web para mostrar y editar un gasto.
  Cada instancia tendrá su propio Shadow DOM con estilos encapsulados.
*/
class MiGasto extends HTMLElement {
  constructor() {
    super();

    // 3.1 Crear shadow root (modo abierto para poder depurar si hace falta)
    this.attachShadow({ mode: "open" });

    // 3.2 Crear la plantilla base del componente
    /* Uso de template string para construir el markup y estilos. No sé qué tan mala
    praxis sea esto... : */
    this.shadowRoot.innerHTML = `
      <style>
        /* Estilos encapsulados - no afectan al resto de la página */
        :host {
          display: block;
          border: 1px solid #ddd;
          padding: 0.6rem;
          margin: 0.5rem 0;
          border-radius: 8px;
          background: #fafafa;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
          font-family: Arial, sans-serif;
        }
        .fila {
          display:flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .datos {
          flex: 1 1 auto;
        }
        .acciones {
          flex: 0 0 auto;
          display:flex;
          gap: 0.4rem;
        }
        button {
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          border: 1px solid #ccc;
          background: white;
          cursor: pointer;
        }
        button:hover { filter: brightness(0.98); }
        .valor { font-weight: 700; margin-right: 0.5rem; }
        .fecha { color: #666; font-size: 0.9rem; margin-right: 0.5rem; }
        .etiquetas { color: #444; font-size: 0.85rem; margin-top: 0.3rem; }
        .editar-form { margin-top: 0.6rem; display: none; }
        .editar-form input { margin-right: 0.4rem; padding: 0.25rem; }
        .visible { display: block; }
      </style>

      <div class="fila">
        <div class="datos">
          <div>
            <span class="descripcion"></span>
            <span class="valor"></span>
            <span class="fecha"></span>
          </div>
          <div class="etiquetas"></div>
        </div>

        <div class="acciones">
          <button type="button" class="btn-editar">Editar</button>
          <button type="button" class="btn-borrar">Borrar</button>
        </div>
      </div>

      <!-- Formulario interno de edición (oculto por defecto) -->
      <form class="editar-form" novalidate>
        <input name="valor" type="number" step="0.01" placeholder="Valor" required />
        <input name="descripcion" type="text" placeholder="Descripción" required />
        <input name="fecha" type="date" />
        <input name="etiquetas" type="text" placeholder="et1 et2 (separadas por espacios)" />
        <button type="submit" class="btn-guardar">Guardar</button>
        <button type="button" class="btn-cancelar">Cancelar</button>
      </form>
    `;

    // 3.3 Referencias internas dentro del shadow DOM
    this.$descripcion = this.shadowRoot.querySelector(".descripcion");
    this.$valor = this.shadowRoot.querySelector(".valor");
    this.$fecha = this.shadowRoot.querySelector(".fecha");
    this.$etiquetas = this.shadowRoot.querySelector(".etiquetas");
    this.$btnEditar = this.shadowRoot.querySelector(".btn-editar");
    this.$btnBorrar = this.shadowRoot.querySelector(".btn-borrar");
    this.$formEditar = this.shadowRoot.querySelector(".editar-form");
    this.$inputValor = this.$formEditar.elements.valor;
    this.$inputDescripcion = this.$formEditar.elements.descripcion;
    this.$inputFecha = this.$formEditar.elements.fecha;
    this.$inputEtiquetas = this.$formEditar.elements.etiquetas;
    this.$btnGuardar = this.shadowRoot.querySelector(".btn-guardar");
    this.$btnCancelar = this.shadowRoot.querySelector(".btn-cancelar");

    // 3.4 Propiedad local que guardará el objeto gasto actual
    this._gasto = null;

    // 3.5 Bind de manejadores para que `this` apunte correctamente
    this._onBorrar = this._onBorrar.bind(this);
    this._onEditar = this._onEditar.bind(this);
    this._onCancelar = this._onCancelar.bind(this);
    this._onGuardar = this._onGuardar.bind(this);
  }
  // -----------------------
  // # posible futuro vigilante de propiedades vía get estático. Actualmente borrado por desuso !
  // -----------------------

  // -----------------------------
  // connectedCallback: llamado cuando el componente se inserta en el DOM
  // -----------------------------
  connectedCallback() {
    // Añadimos listeners de los botones y formulario
    this.$btnBorrar.addEventListener("click", this._onBorrar);
    this.$btnEditar.addEventListener("click", this._onEditar);
    this.$btnCancelar.addEventListener("click", this._onCancelar);
    this.$formEditar.addEventListener("submit", this._onGuardar);
  }

  // -----------------------------
  // disconnectedCallback: limpiar listeners al eliminar el nodo
  // -----------------------------
  disconnectedCallback() {
    this.$btnBorrar.removeEventListener("click", this._onBorrar);
    this.$btnEditar.removeEventListener("click", this._onEditar);
    this.$btnCancelar.removeEventListener("click", this._onCancelar);
    this.$formEditar.removeEventListener("submit", this._onGuardar);
  }

  // -----------------------------
  // Propiedad pública 'gasto' para asignar el objeto gasto
  // -----------------------------
  set gasto(obj) {
    // Guardamos referencia al objeto
    this._gasto = obj;
    // Renderizamos la vista con los datos actuales
    this._render();
  }

  get gasto() {
    return this._gasto;
  }

  // -----------------------------
  // _render: actualiza la UI del componente con this._gasto
  // -----------------------------
  _render() {
    if (!this._gasto) return;

    // Mostramos descripción
    this.$descripcion.textContent =
      this._gasto.descripcion || "— sin descripción —";

    // Mostramos valor con símbolo euro
    this.$valor.textContent = ` ${this._gasto.valor} €`;

    // Mostramos fecha en formato local legible
    try {
      this.$fecha.textContent = new Date(this._gasto.fecha).toLocaleString();
    } catch (e) {
      this.$fecha.textContent = "";
    }

    // Mostramos etiquetas como texto separado por comas
    if (
      Array.isArray(this._gasto.etiquetas) &&
      this._gasto.etiquetas.length > 0
    ) {
      this.$etiquetas.textContent =
        "Etiquetas: " + this._gasto.etiquetas.join(", ");
    } else {
      this.$etiquetas.textContent = "";
    }

    // Rellenamos los campos del formulario de edición por defecto
    if (this.$inputValor) this.$inputValor.value = this._gasto.valor ?? "";
    if (this.$inputDescripcion)
      this.$inputDescripcion.value = this._gasto.descripcion ?? "";
    if (this.$inputFecha) {
      // Convertimos la fecha (ms) a YYYY-MM-DD para input type=date
      let d = new Date(this._gasto.fecha);
      // Ajuste simple: obtener YYYY-MM-DD
      let yyyy = d.getFullYear();
      let mm = String(d.getMonth() + 1).padStart(2, "0");
      let dd = String(d.getDate()).padStart(2, "0");
      this.$inputFecha.value = `${yyyy}-${mm}-${dd}`;
    }
    if (this.$inputEtiquetas)
      this.$inputEtiquetas.value = (this._gasto.etiquetas || []).join(" ");
  }

  // -----------------------------
  // Handlers de eventos del componente
  // -----------------------------
  _onBorrar() {
    // Avisamos al exterior mediante un CustomEvent para que actúe (borrar en la capa de datos)
    // Confirmación local (además el principal podría volver a confirmar)
    if (!confirm("¿Seguro que desea borrar este gasto?")) return;

    // Disparamos evento 'gasto-borrar' con el id del gasto en detail
    this.dispatchEvent(
      new CustomEvent("gasto-borrar", {
        detail: { id: this._gasto?.id },
        bubbles: true, // importante para que el listener en el DOM principal lo capture
        composed: true,
      })
    );
  }

  _onEditar() {
    // Mostrar/ocultar el formulario de edición
    this.$formEditar.classList.toggle("visible");
  }

  _onCancelar() {
    // Ocultar formulario de edición sin guardar cambios
    this.$formEditar.classList.remove("visible");
    // Rellenamos los campos con los valores actuales por si se han modificado
    this._render();
  }

  _onGuardar(evento) {
    // Manejador del submit del formulario de edición
    evento.preventDefault();

    // Leemos valores desde inputs
    let nuevoValor = parseFloat(this.$inputValor.value);
    let nuevaDesc = this.$inputDescripcion.value.trim();
    let nuevaFecha = this.$inputFecha.value; // YYYY-MM-DD
    let nuevasEtiquetas = this.$inputEtiquetas.value.trim().length
      ? this.$inputEtiquetas.value.trim().split(/\s+/)
      : [];

    // Construir objeto con cambios. Incluimos id para identificar
    let actualizado = {
      id: this._gasto.id,
      descripcion: nuevaDesc,
      valor: isNaN(nuevoValor) ? this._gasto.valor : nuevoValor,
      fecha: nuevaFecha ? Date.parse(nuevaFecha) : this._gasto.fecha,
      etiquetas: nuevasEtiquetas,
    };

    // Emitimos evento 'gasto-editar' con el objeto actualizado
    this.dispatchEvent(
      new CustomEvent("gasto-editar", {
        detail: { gasto: actualizado },
        bubbles: true,
        composed: true,
      })
    );

    // Ocultamos el formulario tras guardar
    this.$formEditar.classList.remove("visible");
  }
}

// Registramos el custom element si no está ya definido
if (!customElements.get("mi-gasto")) {
  customElements.define("mi-gasto", MiGasto);
}

// -----------------------------
// 4) Construcción del formulario de creación (reutilizando V1 en esencia)
// -----------------------------
/*
  Creamos aquí un formulario muy similar al de V1 pero más claro:
  - campos: valor, descripcion, fecha, etiquetas
  - al enviar: crear instancia con gestion.CrearGasto y usar gestion.anyadirGasto
  - luego repintamos la lista llamando a pintarGastosWeb()
*/
function crearFormularioCreacion() {
  // Crear form
  let form = document.createElement("form");
  form.setAttribute("id", "form-crear-gasto");
  form.setAttribute("aria-label", "Formulario creación gasto");
  form.setAttribute("autocomplete", "off");

  // Campo valor
  let campoValor = document.createElement("input");
  campoValor.setAttribute("name", "valor");
  campoValor.setAttribute("type", "number");
  campoValor.setAttribute("step", "0.01");
  campoValor.setAttribute("placeholder", "Valor (€)");
  campoValor.required = true;

  // Campo descripción
  let campoDesc = document.createElement("input");
  campoDesc.setAttribute("name", "descripcion");
  campoDesc.setAttribute("type", "text");
  campoDesc.setAttribute("placeholder", "Descripción");
  campoDesc.required = true;

  // Campo fecha
  let campoFecha = document.createElement("input");
  campoFecha.setAttribute("name", "fecha");
  campoFecha.setAttribute("type", "date");

  // Campo etiquetas (texto separado por espacios)
  let campoEtiquetas = document.createElement("input");
  campoEtiquetas.setAttribute("name", "etiquetas");
  campoEtiquetas.setAttribute("type", "text");
  campoEtiquetas.setAttribute(
    "placeholder",
    "etiquetas separadas por espacios"
  );

  // Botón de envío
  let botonEnvio = document.createElement("button");
  botonEnvio.setAttribute("type", "submit");
  botonEnvio.textContent = "Crear";

  // Agrupar y añadir al form (puedes ajustar el orden)
  form.append(campoValor, campoDesc, campoFecha, campoEtiquetas, botonEnvio);

  // Manejador submit
  form.addEventListener("submit", function (eventEnviado) {
    eventEnviado.preventDefault();

    // Lectura de valores
    let valor = parseFloat(eventEnviado.target.elements.valor.value);
    let desc = eventEnviado.target.elements.descripcion.value.trim();
    let fecha = eventEnviado.target.elements.fecha.value; // formato YYYY-MM-DD o ""
    let etiquetas = eventEnviado.target.elements.etiquetas.value.trim().length
      ? eventEnviado.target.elements.etiquetas.value.trim().split(/\s+/)
      : [];

    // Validaciones básicas
    if (!desc) {
      alert("La descripción es obligatoria.");
      return;
    }
    if (isNaN(valor) || valor < 0) {
      alert("Introduce un valor numérico >= 0.");
      return;
    }

    // Creación del gasto usando el constructor exportado por el módulo de negocio
    let nuevo = new gestion.CrearGasto(desc, valor, fecha, ...etiquetas);

    // Añadimos el gasto a la capa de datos (gestion.anyadirGasto)
    gestion.anyadirGasto(nuevo);

    // Limpiamos el formulario
    eventEnviado.target.reset();

    // Repintamos la lista y el total
    pintarGastosWeb();
  });

  // Insertar el formulario en el div correspondiente (limpiando antes)
  divForm.innerHTML = "";
  divForm.appendChild(form);
}

// -----------------------------
// 5) Funciones de actualización de datos (ayudantes)
// -----------------------------
/*
  En el módulo de negocio no había una función explícita tipo 'editarGasto'.
  Por tanto, al editar vamos a:
    - buscar en el array devuelto por gestion.listarGastos()
    - modificar el objeto encontrado (mutación in-place)
  Esto es seguro aquí porque el array y los objetos son gestionados en memoria.
*/
function actualizarGastoLocal(actualizado) {
  // listado referencia al array interno (si listarGastos devuelve copia cambiaría)
  let lista = gestion.listarGastos();
  for (let i = 0; i < lista.length; i++) {
    if (lista[i].id === actualizado.id) {
      // Actualizamos las propiedades permitidas
      lista[i].descripcion = actualizado.descripcion;
      lista[i].valor =
        typeof actualizado.valor === "number" && actualizado.valor >= 0
          ? actualizado.valor
          : lista[i].valor;
      // Si 'fecha' viene como número (ms) o como string parseable, lo dejamos
      if (!isNaN(Date.parse(new Date(actualizado.fecha)))) {
        // 'actualizado.fecha' ya viene como ms (Date.parse) desde el componente
        lista[i].fecha = actualizado.fecha;
      }
      // Etiquetas: reemplazamos completamente (podríamos mezclar si se desea)
      lista[i].etiquetas = Array.isArray(actualizado.etiquetas)
        ? [...actualizado.etiquetas]
        : lista[i].etiquetas;
      return true;
    }
  }
  return false;
}

// -----------------------------
// 6) Pintar lista de gastos usando <mi-gasto>
// -----------------------------
/*
  Esta función vacía el contenedor y por cada gasto crea un <mi-gasto>,
  le asigna la propiedad gasto (objeto) y lo añade al DOM. Además,
  añade listeners globales para los eventos personalizados que emiten los componentes.
*/
function pintarGastosWeb() {
  // Limpiamos contenedor
  divLista.innerHTML = "";

  // Obtenemos la lista actual (array)
  let lista = gestion.listarGastos();

  // Por cada gasto, creamos el elemento personalizado
  for (let g of lista) {
    let nodo = document.createElement("mi-gasto");

    // Asignamos el objeto gasto al componente (esto hace que el componente se renderice)
    nodo.gasto = g;

    // Añadimos el nodo al contenedor
    divLista.appendChild(nodo);
  }

  // Actualizamos el total visible
  actualizarTotal();
}

// -----------------------------
// 7) Actualizar vista del total y presupuesto
// -----------------------------
function actualizarTotal() {
  // gestion.calcularTotalGastos() devuelve un número; lo mostramos con texto contextual
  let total = gestion.calcularTotalGastos();
  // Si existe una función mostrarPresupuesto, añadimos también balance
  let texto = `Total gastos: ${total} €`;
  try {
    let balance = gestion.calcularBalance();
    texto += ` — Balance: ${balance} €`;
  } catch (err) {
    // Si calcularBalance no existe o lanza error, lo ignoramos
  }
  divTotal.textContent = texto;
}

// -----------------------------
// 8) Listeners globales para eventos que disparan los componentes
// -----------------------------
/*
  Escuchamos en `divLista` (o document) los eventos compuestos `gasto-borrar` y `gasto-editar`
  para aplicar los cambios en la capa de datos y repintar la interfaz.
*/
divLista.addEventListener("gasto-borrar", function (eventBorrado) {
  // eB.detail.id contiene el id del gasto a borrar
  let id = eventBorrado.detail?.id;
  if (typeof id === "undefined") return;

  // Confirmamos (doble confirmación opcional)
  if (!confirm("¿Confirmas eliminar este gasto?")) return;

  // Llamamos a la función del módulo de negocio
  gestion.borrarGasto(id);

  // Repintamos UI
  pintarGastosWeb();
});

divLista.addEventListener("gasto-editar", function (eventEditado) {
  // eEd.detail.gasto contiene el objeto actualizado
  let actualizado = eventEditado.detail?.gasto;
  if (!actualizado) return;

  // Actualizamos localmente el objeto en el array
  let ok = actualizarGastoLocal(actualizado);
  if (!ok) {
    // Si no encontró el gasto, podemos alertar o intentar otra cosa
    alert("No se encontró el gasto para actualizar.");
    return;
  }

  // Repintamos UI
  pintarGastosWeb();
});

// -----------------------------
// 9) Inicialización: crear formulario y pintar lista inicial
// -----------------------------
/*
  Al cargar el script:
    - construimos el formulario de creación (en base a V1)
    - pintamos la lista actual (podría estar vacía)
    - conectamos listeners ya definidos
*/
crearFormularioCreacion();
pintarGastosWeb();

// ===============================
// GUARDAR LISTADO EN localStorage
// ===============================
document.getElementById("btnGuardar").addEventListener("click", () => {
  const lista = gestion.listarGastos(); // obtenemos el array de gastos actual
  const cadena = JSON.stringify(lista); // lo convertimos a cadena

  localStorage.setItem("misGastos", cadena);

  alert("Gastos guardados correctamente en el almacenamiento local.");
});

// ===============================
// CARGAR LISTADO DESDE localStorage
// ===============================
document.getElementById("btnCargar").addEventListener("click", () => {
  const datos = localStorage.getItem("misGastos");

  if (!datos) {
    alert("No hay datos guardados.");
    return;
  }

  const arrayPlano = JSON.parse(datos); // recuperamos la lista "plana"

  // Reconstrucción de objetos CrearGasto conservando id y fecha
  const reconstruidos = arrayPlano.map((g) => {
    // Aseguramos que la fecha sea numérica (milisegundos)
    const fechaCorrecta =
      typeof g.fecha === "number" ? g.fecha : Date.parse(g.fecha);

    // Creamos el objeto gasto
    const nuevoGasto = new gestion.CrearGasto(
      g.descripcion,
      g.valor,
      fechaCorrecta,
      ...g.etiquetas
    );

    // Conservamos el id original
    nuevoGasto.id = g.id;

    return nuevoGasto;
  });

  // Reemplaza por completo el listado actual
  gestion.setListadoGastos(reconstruidos);

  // Repintar lista en pantalla usando tus Web Components <mi-gasto>
  pintarGastosWeb();

  // Opcional: mostrar mensaje
  alert("Listado recuperado del almacenamiento local.");
});
