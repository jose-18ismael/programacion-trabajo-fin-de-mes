const MAX_CLIENTES = 20;

const state = {
  clientes: [],
  cola: [],
  historial: [],
  proximoTurno: 1,
  clienteEncontrado: null,
};

const form = document.getElementById('clienteForm');
const codigoInput = document.getElementById('codigo');
const nombreInput = document.getElementById('nombre');
const edadInput = document.getElementById('edad');
const servicioSelect = document.getElementById('servicio');
const especialidadField = document.getElementById('especialidadField');
const especialidadSelect = document.getElementById('especialidad');
const clienteSelect = document.getElementById('clienteSelect');
const buscarCodigoInput = document.getElementById('buscarCodigo');
const buscarResultado = document.getElementById('buscarResultado');
const editarBtn = document.getElementById('editarBtn');
const editarClienteDialog = document.getElementById('editarClienteDialog');
const editarClienteForm = document.getElementById('editarClienteForm');
const editCodigoInput = document.getElementById('editCodigo');
const editNombreInput = document.getElementById('editNombre');
const editEdadInput = document.getElementById('editEdad');
const editServicioSelect = document.getElementById('editServicio');
const editEspecialidadField = document.getElementById('editEspecialidadField');
const editEspecialidadSelect = document.getElementById('editEspecialidad');
const encolarBtn = document.getElementById('encolarBtn');
const atenderBtn = document.getElementById('atenderBtn');
const consultarColaBtn = document.getElementById('consultarColaBtn');
const consultarHistorialBtn = document.getElementById('consultarHistorialBtn');
const popHistorialBtn = document.getElementById('popHistorialBtn');
const reiniciarBtn = document.getElementById('reiniciarBtn');
const mensajeTexto = document.getElementById('mensajeTexto');
const mobileResetBtn = document.getElementById('mobileResetBtn');
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');

const totalClientesEl = document.getElementById('totalClientes');
const totalColaEl = document.getElementById('totalCola');
const totalHistorialEl = document.getElementById('totalHistorial');
const arregloClientesEl = document.getElementById('arregloClientes');
const colaClientesEl = document.getElementById('colaClientes');
const historialAtencionesEl = document.getElementById('historialAtenciones');

function setMessage(texto) {
  mensajeTexto.textContent = texto;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function actualizarCampoEspecialidad() {
  const esConsulta = servicioSelect.value === 'Consulta';
  especialidadField.hidden = !esConsulta;
  especialidadSelect.required = esConsulta;

  if (!esConsulta) {
    especialidadSelect.value = '';
  }
}

function actualizarCampoEspecialidadEdicion() {
  const esConsulta = editServicioSelect.value === 'Consulta';
  editEspecialidadField.hidden = !esConsulta;
  editEspecialidadSelect.required = esConsulta;

  if (!esConsulta) {
    editEspecialidadSelect.value = '';
  }
}

function describirCliente(cliente) {
  return `Código: ${cliente.codigo} · ${cliente.nombre} · ${cliente.edad} años · ${cliente.servicio}${cliente.especialidad ? ` (${cliente.especialidad})` : ''} · Turno #${cliente.turno}`;
}

function actualizarEstadisticas() {
  totalClientesEl.textContent = String(state.clientes.length);
  totalColaEl.textContent = String(state.cola.length);
  totalHistorialEl.textContent = String(state.historial.length);
}

function actualizarCodigoControl() {
  codigoInput.value = String(Math.min(state.clientes.length + 1, MAX_CLIENTES));
}

function renderClienteSelect() {
  clienteSelect.innerHTML = '<option value="">Seleccionar cliente</option>';

  state.clientes
    .filter((cliente) => (
      !cliente.atendido
      && !state.cola.some((enCola) => enCola.codigo === cliente.codigo)
    ))
    .forEach((cliente) => {
      const option = document.createElement('option');
      option.value = cliente.codigo;
      option.textContent = `${cliente.codigo} - ${cliente.nombre}`;
      clienteSelect.appendChild(option);
    });
}

function renderArreglo() {
  arregloClientesEl.innerHTML = '';

  for (let i = 0; i < MAX_CLIENTES; i += 1) {
    const slot = document.createElement('div');
    const cliente = state.clientes[i];

    if (cliente) {
      slot.className = 'array-slot';
      slot.innerHTML = `
        <strong>${escapeHTML(cliente.nombre)}</strong>
        <small>${escapeHTML(cliente.codigo)}</small>
        <small>${escapeHTML(cliente.edad)} años</small>
        <small>Turno #${escapeHTML(cliente.turno)}</small>
        <small>${escapeHTML(cliente.servicio)}</small>
        ${cliente.especialidad ? `<small>${escapeHTML(cliente.especialidad)}</small>` : ''}
      `;
    } else {
      slot.className = 'array-slot empty';
      slot.innerHTML = `
        <strong>Vacío</strong>
        <small>Posición ${i + 1}</small>
      `;
    }

    arregloClientesEl.appendChild(slot);
  }
}

function renderCola() {
  colaClientesEl.innerHTML = '';

  if (state.cola.length === 0) {
    colaClientesEl.innerHTML = '<div class="empty-state">La cola está vacía.</div>';
    return;
  }

  state.cola.forEach((cliente) => {
    const item = document.createElement('div');
    item.className = 'queue-item';
    item.innerHTML = `
      <strong>${escapeHTML(cliente.nombre)}</strong>
      <small>${escapeHTML(cliente.codigo)}</small>
      <small>Turno #${escapeHTML(cliente.turno)}</small>
      <small>${escapeHTML(cliente.especialidad || cliente.servicio)}</small>
    `;
    colaClientesEl.appendChild(item);
  });
}

function renderHistorial() {
  historialAtencionesEl.innerHTML = '';

  if (state.historial.length === 0) {
    historialAtencionesEl.innerHTML = '<div class="empty-state">No hay operaciones en el historial.</div>';
    return;
  }

  [...state.historial].reverse().forEach((registro) => {
    const item = document.createElement('div');
    item.className = 'stack-item';
    item.innerHTML = `
      <strong>${escapeHTML(registro.cliente)}</strong>
      <small>${escapeHTML(registro.servicio)}</small>
      <small>${escapeHTML(registro.descripcion)}</small>
    `;
    historialAtencionesEl.appendChild(item);
  });
}

function render() {
  actualizarCodigoControl();
  renderClienteSelect();
  renderArreglo();
  renderCola();
  renderHistorial();
  actualizarEstadisticas();
}

function registrarCliente(event) {
  event.preventDefault();

  const codigo = String(state.clientes.length + 1);
  const nombre = nombreInput.value.trim();
  const edad = Number(edadInput.value);
  const servicio = servicioSelect.value;
  const especialidad = especialidadSelect.value;

  if (!nombre || !servicio || !Number.isInteger(edad) || edad < 1 || edad > 120
    || (servicio === 'Consulta' && !especialidad)) {
    setMessage('Complete correctamente todos los campos del formulario.');
    return;
  }

  if (state.clientes.length >= MAX_CLIENTES) {
    setMessage('El arreglo de clientes está lleno. Máximo 20 registros.');
    return;
  }

  const nuevoCliente = {
    codigo,
    nombre,
    edad,
    servicio,
    especialidad: servicio === 'Consulta' ? especialidad : '',
    turno: state.proximoTurno,
  };

  state.clientes.push(nuevoCliente);
  state.proximoTurno += 1;

  form.reset();
  actualizarCampoEspecialidad();
  setMessage(`Paciente ${nombre} registrado. Código ${nuevoCliente.codigo}, turno #${nuevoCliente.turno}. Agréguelo a la cola cuando esté listo.`);
  render();
}

function buscarCliente() {
  const codigo = buscarCodigoInput.value.trim();

  if (!codigo) {
    state.clienteEncontrado = null;
    buscarResultado.textContent = 'Ingrese un código para buscar.';
    editarBtn.hidden = true;
    return;
  }

  const cliente = state.clientes.find((item) => item.codigo.toLowerCase() === codigo.toLowerCase());
  state.clienteEncontrado = cliente || null;
  editarBtn.hidden = !cliente;
  buscarResultado.textContent = cliente
    ? describirCliente(cliente)
    : `No se encontró un cliente con el código ${codigo}.`;
}

function abrirEdicionCliente() {
  const cliente = state.clienteEncontrado;
  if (!cliente) {
    setMessage('Busque un cliente registrado antes de modificarlo.');
    return;
  }

  editCodigoInput.value = cliente.codigo;
  editNombreInput.value = cliente.nombre;
  editEdadInput.value = String(cliente.edad);
  editServicioSelect.value = cliente.servicio;
  editEspecialidadSelect.value = cliente.especialidad || '';
  actualizarCampoEspecialidadEdicion();
  editarClienteDialog.showModal();
  editNombreInput.focus();
}

function guardarCambiosCliente(event) {
  event.preventDefault();
  const cliente = state.clienteEncontrado;
  if (!cliente) {
    editarClienteDialog.close();
    setMessage('No se pudo encontrar el cliente que desea modificar.');
    return;
  }

  const nombre = editNombreInput.value.trim();
  const edad = Number(editEdadInput.value);
  const servicio = editServicioSelect.value;
  const especialidad = editEspecialidadSelect.value;
  if (!nombre || !Number.isInteger(edad) || edad < 1 || edad > 120
    || !servicio || (servicio === 'Consulta' && !especialidad)) {
    setMessage('Revise el nombre, la edad y el tipo de servicio.');
    return;
  }

  Object.assign(cliente, {
    nombre,
    edad,
    servicio,
    especialidad: servicio === 'Consulta' ? especialidad : '',
  });
  editarClienteDialog.close();
  buscarResultado.textContent = describirCliente(cliente);
  setMessage(`Información del cliente ${cliente.codigo} modificada correctamente.`);
  render();
}

function agregarACola() {
  const codigoSeleccionado = clienteSelect.value;

  if (!codigoSeleccionado) {
    setMessage('Debe seleccionar un cliente registrado antes de agregarlo a la cola.');
    return;
  }

  const cliente = state.clientes.find((item) => item.codigo === codigoSeleccionado);
  if (!cliente) {
    setMessage('El cliente seleccionado no existe en el arreglo.');
    return;
  }

  const yaEnCola = state.cola.some((item) => item.codigo === codigoSeleccionado);
  if (yaEnCola) {
    setMessage('Ese cliente ya está en la cola de espera.');
    return;
  }

  state.cola.push(cliente);
  setMessage(`El cliente ${cliente.nombre} fue agregado a la cola de espera.`);
  render();
}

function atenderCliente() {
  if (state.cola.length === 0) {
    setMessage('No hay clientes pendientes en la cola.');
    return;
  }

  const atendido = state.cola.shift();
  atendido.atendido = true;

  const registro = {
    cliente: atendido.nombre,
    servicio: atendido.especialidad || atendido.servicio,
    descripcion: `Atendido · ${new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date())}`,
  };

  state.historial.push(registro);
  setMessage(`Atendiendo a ${atendido.nombre} (${atendido.servicio}).`);
  render();
}

function consultarProximoTurno() {
  if (state.cola.length === 0) {
    setMessage('La cola está vacía. No hay un próximo turno para consultar.');
    return;
  }

  const siguiente = state.cola[0];
  setMessage(`Próximo turno (Peek): ${siguiente.nombre}, turno #${siguiente.turno} · ${siguiente.especialidad || siguiente.servicio}.`);
}

function consultarUltimaOperacion() {
  if (state.historial.length === 0) {
    setMessage('El historial está vacío. No hay una última operación para consultar.');
    return;
  }

  const ultima = state.historial[state.historial.length - 1];
  setMessage(`Última operación (Peek): ${ultima.cliente} · ${ultima.servicio} · ${ultima.descripcion}.`);
}

function retirarUltimoHistorial() {
  if (state.historial.length === 0) {
    setMessage('La pila de historial está vacía. No hay operaciones para retirar.');
    return;
  }

  const retirado = state.historial.pop();
  setMessage(`Se retiró la última operación: ${retirado.cliente} - ${retirado.servicio}.`);
  render();
}

function reiniciarSistema() {
  state.clientes = [];
  state.cola = [];
  state.historial = [];
  state.proximoTurno = 1;
  state.clienteEncontrado = null;
  buscarCodigoInput.value = '';
  buscarResultado.textContent = 'Busca un cliente para consultar o modificar sus datos.';
  editarBtn.hidden = true;
  setMessage('Sistema reiniciado. Todos los registros, cola e historial quedaron vacíos.');
  render();
}

function closeMobileMenu() {
  mobileMenu.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menú');
}

servicioSelect.addEventListener('change', actualizarCampoEspecialidad);
form.addEventListener('submit', registrarCliente);
document.getElementById('buscarBtn').addEventListener('click', buscarCliente);
buscarCodigoInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    buscarCliente();
  }
});
editarBtn.addEventListener('click', abrirEdicionCliente);
editServicioSelect.addEventListener('change', actualizarCampoEspecialidadEdicion);
editarClienteForm.addEventListener('submit', guardarCambiosCliente);
document.getElementById('cancelEditBtn').addEventListener('click', () => editarClienteDialog.close());
encolarBtn.addEventListener('click', agregarACola);
atenderBtn.addEventListener('click', atenderCliente);
consultarColaBtn.addEventListener('click', consultarProximoTurno);
consultarHistorialBtn.addEventListener('click', consultarUltimaOperacion);
popHistorialBtn.addEventListener('click', retirarUltimoHistorial);
reiniciarBtn.addEventListener('click', reiniciarSistema);
mobileResetBtn.addEventListener('click', () => {
  closeMobileMenu();
  reiniciarSistema();
});
menuToggle.addEventListener('click', () => {
  const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
  mobileMenu.hidden = isExpanded;
  menuToggle.setAttribute('aria-expanded', String(!isExpanded));
  menuToggle.setAttribute('aria-label', isExpanded ? 'Abrir menú' : 'Cerrar menú');
});
mobileMenu.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    closeMobileMenu();
  }
});
render();
