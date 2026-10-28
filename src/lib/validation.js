const ESTADOS = ['Recibido', 'En diagnóstico', 'En reparación', 'Reparación terminada', 'Entregado'];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function requiredString(value, field, max) {
  if (typeof value !== 'string' || !value.trim()) throw Object.assign(new Error(`${field} es obligatorio.`), { status: 400 });
  const clean = value.trim();
  if (max && clean.length > max) throw Object.assign(new Error(`${field} debe tener como máximo ${max} caracteres.`), { status: 400 });
  return clean;
}
function validateCliente(data) {
  const nombre = requiredString(data.nombre, 'El nombre', 100);
  const telefono = requiredString(data.telefono, 'El teléfono', 20);
  const correo = data.correo ? requiredString(data.correo, 'El correo', 100).toLowerCase() : null;
  if (correo && !emailPattern.test(correo)) throw Object.assign(new Error('Ingresa un correo válido.'), { status: 400 });
  if (!/^[+\d()\s-]{7,20}$/.test(telefono)) throw Object.assign(new Error('Ingresa un teléfono válido.'), { status: 400 });
  return { nombre, telefono, correo };
}
function validateReparacion(data) {
  const equipo = {
    tipo: requiredString(data.tipo, 'El tipo de equipo', 50),
    marca: requiredString(data.marca, 'La marca', 50),
    modelo: data.modelo ? requiredString(data.modelo, 'El modelo', 50) : null,
    problema_reportado: requiredString(data.problemaReportado, 'El problema reportado', 255)
  };
  if (data.clienteId && (!Number.isInteger(Number(data.clienteId)) || Number(data.clienteId) < 1)) throw Object.assign(new Error('Selecciona un cliente válido.'), { status: 400 });
  if (!data.clienteId && !data.cliente) throw Object.assign(new Error('Busca un cliente existente o registra uno nuevo.'), { status: 400 });
  const cliente = data.cliente ? validateCliente(data.cliente) : null;
  return { clienteId: data.clienteId ? Number(data.clienteId) : null, cliente, equipo };
}
function parseId(value) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) throw Object.assign(new Error('El identificador de reparación no es válido.'), { status: 400 });
  return id;
}
function validateEstado(estado) {
  if (!ESTADOS.includes(estado)) throw Object.assign(new Error('Selecciona un estado válido.'), { status: 400 });
  return estado;
}
function normalizePhoneSearch(value) {
  return String(value ?? '').replace(/\D/g, '');
}
function validateDiagnosticoCosto(data) {
  const diagnostico = data.diagnostico == null ? '' : requiredString(data.diagnostico, 'El diagnóstico', 5000);
  let costo = null;
  if (data.costo !== '' && data.costo != null) {
    costo = Number(data.costo);
    if (!Number.isFinite(costo) || costo < 0 || costo > 99999999.99) throw Object.assign(new Error('Ingresa un costo válido mayor o igual a cero.'), { status: 400 });
  }
  return { diagnostico: diagnostico || null, costo };
}
module.exports = { ESTADOS, requiredString, validateCliente, validateReparacion, validateEstado, validateDiagnosticoCosto, parseId, normalizePhoneSearch };
