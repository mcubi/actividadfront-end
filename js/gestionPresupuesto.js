// ===============================
// Variables globales
// ===============================
let presupuesto = 0;
let gastos = [];
let contadorId = 0;

// ===============================
// Funciones de presupuesto
// ===============================
function actualizarPresupuesto(valor) {
  if (typeof valor === "number" && valor >= 0) {
    presupuesto = valor;
    return presupuesto;
  }
  return -1;
}

function mostrarPresupuesto() {
  return `Tu presupuesto actual es de ${presupuesto} €`;
}

// ===============================
// Función constructora CrearGasto
// ===============================
function CrearGasto(descripcion, valor = 0, fecha, ...etiquetas) {
  if (!(this instanceof CrearGasto)) {
    return new CrearGasto(descripcion, valor, fecha, ...etiquetas);
  }

  this.descripcion = descripcion;
  this.valor = typeof valor === "number" && valor >= 0 ? valor : 0;

  // Gestión de fecha
  if (!fecha) {
    this.fecha = Date.now();
  } else {
    let parsed = Date.parse(fecha);
    this.fecha = isNaN(parsed) ? Date.now() : parsed;
  }

  // Etiquetas
  this.etiquetas = etiquetas.length ? [...etiquetas] : [];

  // Métodos
  this.mostrarGasto = function () {
    return `Gasto correspondiente a ${this.descripcion} con valor ${this.valor} €`;
  };

  this.mostrarGastoCompleto = function () {
    let fechaLocal = new Date(this.fecha).toLocaleString();
    let texto = `Gasto correspondiente a ${this.descripcion} con valor ${this.valor} €.\n`;
    texto += `Fecha: ${fechaLocal}\n`;
    texto += `Etiquetas:\n`;
    this.etiquetas.forEach((et) => {
      texto += `- ${et}\n`;
    });
    return texto;
  };

  this.actualizarDescripcion = function (nuevaDescripcion) {
    this.descripcion = nuevaDescripcion;
  };

  this.actualizarValor = function (nuevoValor) {
    if (typeof nuevoValor === "number" && nuevoValor >= 0) {
      this.valor = nuevoValor;
    }
  };

  this.actualizarFecha = function (nuevaFecha) {
    let parsed = Date.parse(nuevaFecha);
    if (!isNaN(parsed)) this.fecha = parsed;
  };

  this.anyadirEtiquetas = function (...nuevas) {
    nuevas.forEach((et) => {
      if (!this.etiquetas.includes(et)) this.etiquetas.push(et);
    });
  };

  this.borrarEtiquetas = function (...aBorrar) {
    this.etiquetas = this.etiquetas.filter((et) => !aBorrar.includes(et));
  };

  this.obtenerPeriodoAgrupacion = function (tipo) {
    let d = new Date(this.fecha);
    let yyyy = d.getFullYear();
    let mm = String(d.getMonth() + 1).padStart(2, "0");
    let dd = String(d.getDate()).padStart(2, "0");
    if (tipo === "dia") return `${yyyy}-${mm}-${dd}`;
    if (tipo === "mes") return `${yyyy}-${mm}`;
    if (tipo === "anyo") return `${yyyy}`;
    return `${yyyy}-${mm}-${dd}`;
  };
}

// ===============================
// Funciones de gestión de gastos
// ===============================
function listarGastos() {
  return gastos;
}

function setListadoGastos(nuevoListado) {
  gastos = nuevoListado;
}

function anyadirGasto(gasto) {
  gasto.id = contadorId++;
  gastos.push(gasto);
}

function borrarGasto(id) {
  gastos = gastos.filter((g) => g.id !== id);
}

function calcularTotalGastos() {
  return gastos.reduce((total, g) => total + g.valor, 0);
}

function calcularBalance() {
  return presupuesto - calcularTotalGastos();
}

// ===============================
// Filtrado y agrupación de gastos
// ===============================
function filtrarGastos(filtros = {}) {
  return gastos.filter((g) => {
    if (filtros.fechaDesde && g.fecha < Date.parse(filtros.fechaDesde))
      return false;
    if (filtros.fechaHasta && g.fecha > Date.parse(filtros.fechaHasta))
      return false;
    if (filtros.valorMinimo != null && g.valor < filtros.valorMinimo)
      return false;
    if (filtros.valorMaximo != null && g.valor > filtros.valorMaximo)
      return false;
    if (
      filtros.descripcionContiene &&
      !g.descripcion
        .toLowerCase()
        .includes(filtros.descripcionContiene.toLowerCase())
    )
      return false;
    if (filtros.etiquetasTiene && filtros.etiquetasTiene.length > 0) {
      let coincide = g.etiquetas.some((e) =>
        filtros.etiquetasTiene.includes(e)
      );
      if (!coincide) return false;
    }
    return true;
  });
}

function agruparGastos(periodo, etiquetas = [], fechaDesde, fechaHasta) {
  let filtrados = gastos;

  if (etiquetas.length > 0) {
    filtrados = filtrados.filter((g) =>
      g.etiquetas.some((e) => etiquetas.includes(e))
    );
  }
  if (fechaDesde)
    filtrados = filtrados.filter((g) => g.fecha >= Date.parse(fechaDesde));
  if (fechaHasta)
    filtrados = filtrados.filter((g) => g.fecha <= Date.parse(fechaHasta));

  let resultado = {};
  for (let g of filtrados) {
    let clave = g.obtenerPeriodoAgrupacion(periodo);
    resultado[clave] = (resultado[clave] || 0) + g.valor;
  }
  return resultado;
}

// ===============================
// Exportaciones agrupadas
// ===============================
export {
  actualizarPresupuesto,
  mostrarPresupuesto,
  CrearGasto,
  listarGastos,
  setListadoGastos,
  anyadirGasto,
  borrarGasto,
  calcularTotalGastos,
  calcularBalance,
  filtrarGastos,
  agruparGastos,
};
