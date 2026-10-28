function spanishError(error) {
  switch (error?.code) {
    case 'SELF_SIGNED_CERT_IN_CHAIN':
    case 'DEPTH_ZERO_SELF_SIGNED_CERT':
    case 'UNABLE_TO_VERIFY_LEAF_SIGNATURE':
      return 'No se pudo validar el certificado TLS de PostgreSQL. Revisa que PGSSL_CA apunte al certificado raíz descargado desde Supabase.';
    case 'ENOENT':
      return 'No se encontró un archivo necesario. Verifica la ruta del certificado indicada en PGSSL_CA.';
    case 'ENOTFOUND':
      return 'No se encontró el servidor de la base de datos. Verifica DATABASE_URL y tu conexión a internet.';
    case 'ECONNREFUSED':
    case 'ECONNRESET':
      return 'Supabase rechazó o interrumpió la conexión. Verifica el host, el puerto y el estado del proyecto.';
    case 'ETIMEDOUT':
      return 'La conexión con Supabase agotó el tiempo de espera. Revisa tu red y la cadena DATABASE_URL.';
    case '28P01':
    case '28000':
      return 'PostgreSQL rechazó las credenciales. Revisa el usuario y la contraseña dentro de DATABASE_URL.';
    case '3D000':
      return 'La base de datos indicada no existe. Revisa el nombre al final de DATABASE_URL.';
    case '42P01':
      return 'No se encontró una tabla requerida. Ejecuta database/schema.sql en Supabase SQL Editor.';
    case '42703':
      return 'La base de datos no tiene una columna esperada. Revisa que el esquema corresponda a este proyecto.';
    case '23505':
      return 'El registro ya existe.';
    case '23503':
    case '23514':
      return 'Los datos no cumplen las relaciones o restricciones de la base de datos.';
    default:
      if (error?.status && error?.message) return error.message;
      return 'Ocurrió un error interno. Intenta nuevamente.';
  }
}

module.exports = { spanishError };
