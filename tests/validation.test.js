const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validateCliente,
  validateReparacion,
  validateEstado,
  validateDiagnosticoCosto,
  parseId,
  normalizePhoneSearch,
} = require("../src/lib/validation");
const { spanishError } = require("../src/lib/error-messages");
test("valida cliente y normaliza correo", () => {
  assert.deepEqual(
    validateCliente({
      nombre: " Ana ",
      telefono: "999 888 777",
      correo: "ANA@example.com",
    }),
    { nombre: "Ana", telefono: "999 888 777", correo: "ana@example.com" },
  );
});
test("rechaza teléfono y correo inválidos", () => {
  assert.throws(
    () =>
      validateCliente({ nombre: "Ana", telefono: "123", correo: "incorrecto" }),
    /correo válido|teléfono válido/,
  );
});
test("valida reparación y obliga cliente", () => {
  assert.throws(
    () =>
      validateReparacion({
        tipo: "Laptop",
        marca: "HP",
        problemaReportado: "No enciende",
      }),
    /cliente existente/,
  );
  assert.equal(
    validateReparacion({
      clienteId: 2,
      tipo: "Laptop",
      marca: "HP",
      problemaReportado: "No enciende",
    }).equipo.tipo,
    "Laptop",
  );
});
test("acepta solo estados del ciclo documentado", () => {
  assert.equal(validateEstado("Recibido"), "Recibido");
  assert.throws(() => validateEstado("En espera"), /estado válido/);
});
test("valida costo no negativo", () => {
  assert.equal(
    validateDiagnosticoCosto({
      diagnostico: "Falla de batería",
      costo: "50.25",
    }).costo,
    50.25,
  );
  assert.throws(
    () => validateDiagnosticoCosto({ costo: "-1" }),
    /costo válido/,
  );
});
test("acepta solo identificadores positivos", () => {
  assert.equal(parseId("7"), 7);
  assert.throws(() => parseId("abc"), /identificador.*válido/);
});
test("traduce errores comunes de conexión al español", () => {
  assert.match(
    spanishError({ code: "SELF_SIGNED_CERT_IN_CHAIN" }),
    /certificado TLS/,
  );
  assert.match(
    spanishError({ code: "ENOTFOUND" }),
    /servidor de la base de datos/,
  );
});
test("normaliza teléfonos escritos con prefijo y separadores", () => {
  assert.equal(normalizePhoneSearch("+51 987-654 321"), "51987654321");
});
