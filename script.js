const MAX_CLIENTES = 20;

const state = {
  clientes: [],
  cola: [],
  historial: [],
  proximoTurno: 1,
};

const form = document.getElementById('clienteForm');
const codigoInput = document.getElementById('codigo');
const nombreInput = document.getElementById('nombre');
const edadInput = document.getElementById('edad');
const servicioSelect = document.getElementById('servicio');
const clienteSelect = document.getElementById('clienteSelect');
const encolarBtn = document.getElementById('encolarBtn');
const atenderBtn = document.getElementById('atenderBtn');
const popHistorialBtn = document.getElementById('popHistorialBtn');
const reiniciarBtn = document.getElementById('reiniciarBtn');
const mensajeTexto = document.getElementById('mensajeTexto');
const mobileResetBtn = document.getElementById('mobileResetBtn');
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const databaseMenuLink = document.getElementById('databaseMenuLink');
const databasePanel = document.getElementById('baseDatos');
const databaseAccessDialog = document.getElementById('databaseAccessDialog');
const databaseAccessForm = document.getElementById('databaseAccessForm');
const databasePinInput = document.getElementById('databasePin');
const accessError = document.getElementById('accessError');
const DATABASE_PIN = '0607';

const totalClientesEl = document.getElementById('totalClientes');
const totalColaEl = document.getElementById('totalCola');
const totalHistorialEl = document.getElementById('totalHistorial');
const arregloClientesEl = document.getElementById('arregloClientes');
const colaClientesEl = document.getElementById('colaClientes');
const historialAtencionesEl = document.getElementById('historialAtenciones');

function setMessage(texto) {
  mensajeTexto.textContent = texto;
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
        <strong>${cliente.nombre}</strong>
        <small>${cliente.codigo}</small>
        <small>Turno #${cliente.turno}</small>
        <small>${cliente.servicio}</small>
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
      <strong>${cliente.nombre}</strong>
      <small>${cliente.codigo}</small>
      <small>Turno #${cliente.turno}</small>
      <small>${cliente.servicio}</small>
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

  [...state.historial].reverse().forEach((registro, index) => {
    const item = document.createElement('div');
    item.className = 'stack-item';
    item.innerHTML = `
      <strong>${registro.cliente}</strong>
      <small>${registro.servicio}</small>
      <small>${registro.descripcion}</small>
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

  if (!nombre || !servicio || !Number.isFinite(edad) || edad <= 0) {
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
    turno: state.proximoTurno,
  };

  state.clientes.push(nuevoCliente);
  state.proximoTurno += 1;

  form.reset();
  setMessage(`Cliente ${nombre} registrado con éxito. Turno asignado #${nuevoCliente.turno}.`);
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
    servicio: atendido.servicio,
    descripcion: `Atendido y registrado en historial`,
  };

  state.historial.push(registro);
  setMessage(`Atendiendo a ${atendido.nombre} (${atendido.servicio}).`);
  render();
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
  setMessage('Sistema reiniciado. Todos los registros, cola e historial quedaron vacíos.');
  render();
}

function closeMobileMenu() {
  mobileMenu.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menú');
}

function requestDatabaseAccess() {
  if (!databasePanel.classList.contains('is-locked')) {
    return;
  }

  databasePinInput.value = '';
  accessError.hidden = true;
  databaseAccessDialog.showModal();
  databasePinInput.focus();
}

form.addEventListener('submit', registrarCliente);
encolarBtn.addEventListener('click', agregarACola);
atenderBtn.addEventListener('click', atenderCliente);
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
  if (event.target.closest('a') === databaseMenuLink) {
    closeMobileMenu();
    if (databasePanel.classList.contains('is-locked')) {
      event.preventDefault();
      requestDatabaseAccess();
    }
    return;
  }

  if (event.target.closest('a')) {
    closeMobileMenu();
  }
});
document.getElementById('unlockDatabaseBtn').addEventListener('click', requestDatabaseAccess);
document.getElementById('cancelAccessBtn').addEventListener('click', () => databaseAccessDialog.close());
databaseAccessDialog.addEventListener('cancel', (event) => event.preventDefault());
databaseAccessForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (databasePinInput.value !== DATABASE_PIN) {
    accessError.hidden = false;
    databasePinInput.select();
    return;
  }

  databasePanel.classList.remove('is-locked');
  databaseAccessDialog.close();
  databasePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

databaseAccessDialog.showModal();
databasePinInput.focus();
render();
