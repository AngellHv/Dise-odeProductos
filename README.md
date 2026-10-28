# GALATECH

Sistema web para registrar y dar seguimiento a reparaciones de equipos tecnológicos. Usa HTML, CSS, JavaScript, Node.js, Express y PostgreSQL en Supabase.

## Puesta en marcha

1. Ejecuta `npm install`.
2. Copia `.env.example` como `.env` y completa la cadena de conexión de Supabase, `JWT_SECRET` y `PGSSL_CA`.
3. Ejecuta `database/schema.sql` desde el SQL Editor de Supabase.
4. Descarga el certificado raíz de Supabase y guárdalo como `certs/prod-supabase.cer`.
5. Ejecuta `npm run db:setup` para crear el acceso del técnico.
6. Inicia con `npm run dev` y abre http://localhost:3000.

Para cargar reparaciones de ejemplo, ejecuta `database/seed-demo-more.sql` en el SQL Editor. Las pruebas locales se ejecutan con `npm test`.

No subas `.env` ni el certificado a GitHub.
