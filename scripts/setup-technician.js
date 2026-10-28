require("dotenv").config();
const { stdin, stdout } = require("node:process");
const bcrypt = require("bcryptjs");
const repo = require("../src/repositories/technician-repository");
const { pool } = require("../src/db/pool");
const { spanishError } = require("../src/lib/error-messages");
function askHidden(prompt) {
  return new Promise((resolve, reject) => {
    if (!stdin.isTTY || typeof stdin.setRawMode !== "function")
      return reject(
        new Error(
          "Ejecuta este comando en una terminal interactiva de PowerShell o VS Code.",
        ),
      );
    stdout.write(prompt);
    stdin.setRawMode(true);
    stdin.resume();
    let value = "";
    const finish = (error) => {
      stdin.removeListener("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write("\n");
      if (error) reject(error);
      else resolve(value);
    };
    const onData = (chunk) => {
      for (const char of chunk.toString("utf8")) {
        if (char === "\u0003") return finish(new Error("Operación cancelada."));
        if (char === "\r" || char === "\n") return finish();
        if (char === "\u007f" || char === "\b") value = value.slice(0, -1);
        else value += char;
      }
    };
    stdin.on("data", onData);
  });
}
(async () => {
  try {
    const name = process.env.INITIAL_TECHNICIAN_NAME || "Técnico GALATECH";
    const username = process.env.INITIAL_TECHNICIAN_USERNAME || "tecnico";
    const password = await askHidden(
      `Contraseña nueva para ${username} (mínimo 12 caracteres; no se mostrará al escribir): `,
    );
    if (password.length < 12)
      throw new Error("La contraseña debe tener al menos 12 caracteres.");
    const hash = await bcrypt.hash(password, 12);
    await repo.create({ nombre: name, usuario: username, hash });
    console.log(
      `Técnico ${username} creado o actualizado. Guarda la contraseña en un lugar seguro.`,
    );
  } catch (e) {
    console.error(spanishError(e));
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
