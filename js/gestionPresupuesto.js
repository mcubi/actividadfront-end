// TODO: Variables globales
let presupuesto = 0;
let gastos = [];
let idGasto = 0;

// Constructor de objetos Gasto
function CrearGasto(descripcion, valor, fecha = new Date(), ...etiquetas) {
  // Validar valor numérico
  if (typeof valor !== "number" || valor <= 0) {
    valor = 0;
  }

  // Fecha: guardar como timestamp (Date.parse)
  let fechaParsed = Date.parse(fecha);
  if (isNaN(fechaParsed)) fechaParsed = Date.parse(new Date());

  // Etiquetas: si no hay, array vacío
  etiquetas = etiquetas.length === 0 ? [] : etiquetas.flat();

  // Crear el objeto
  this.descripcion = descripcion;
  this.valor = valor;
  this.fecha = fechaParsed;
  this.etiquetas = etiquetas;

  // Métodos requeridos
  this.mostrarGastoCompleto = function () {
    let fechaLocale = new Date(this.fecha).toLocaleString();
    let lista = this.etiquetas.map((e) => `- ${e}`).join("\n");
    return `Gasto correspondiente a ${this.descripcion} con valor ${this.valor} €.\nFecha: ${fechaLocale}\nEtiquetas:\n${lista}\n`;
  };

  this.actualizarFecha = function (nuevaFecha) {
    let parsed = Date.parse(nuevaFecha);
    if (!isNaN(parsed)) this.fecha = parsed;
  };

  this.actualizarValor = function (nuevoValor) {
    if (typeof nuevoValor === "number" && nuevoValor > 0)
      this.valor = nuevoValor;
  };

  this.anyadirEtiquetas = function (...nuevas) {
    nuevas.forEach((et) => {
      if (!this.etiquetas.includes(et)) this.etiquetas.push(et);
    });
  };

  this.borrarEtiquetas = function (...aBorrar) {
    this.etiquetas = this.etiquetas.filter((et) => !aBorrar.includes(et));
  };
}

// Mostrar mi presupuesto
function mostrarPresupuesto() {
  return `Tu presupuesto actual es de ${presupuesto} €`;
}

// Actualizar mi presupuesto
function actualizarPresupuesto(valor) {
  // Validar que sea número y positivo
  if (typeof valor !== "number" || valor <= 0) {
    return -1;
  }

  presupuesto = valor;
  return presupuesto;
}

// Listar mis gastos
function listarGastos() {
  return gastos;
}

function anyadirGasto(gasto) {
  if (!gasto || typeof gasto !== "object") return;

  gasto.id = idGasto++;
  gastos.push(gasto);
}

// Borrar un gasto
function borrarGasto(id) {
  gastos = gastos.filter((g) => g.id !== id);
}

// Calcular los gastos
function calcularTotalGastos() {
  return gastos.reduce((total, g) => total + g.valor, 0);
}

// Sacar el balance
function calcularBalance() {
  return presupuesto - calcularTotalGastos();
}

// Mostrar un gasto
CrearGasto.prototype.mostrarGasto = function () {
  return `Gasto correspondiente a ${this.descripcion} con valor ${this.valor} €`;
};

// METODO: Actualizar descripcion
CrearGasto.prototype.actualizarDescripcion = function (nuevaDesc) {
  this.descripcion = nuevaDesc;
};

// Exportar las funciones y constructor
export {
  mostrarPresupuesto,
  actualizarPresupuesto,
  CrearGasto,
  listarGastos,
  anyadirGasto,
  borrarGasto,
  calcularTotalGastos,
  calcularBalance,
};
