# GALATECH

Sistema web para organizar reparaciones de equipos tecnológicos. El técnico registra los equipos y actualiza su estado; el cliente consulta el avance con un código de seguimiento.

## Funcionalidades implementadas

- Inicio de sesión para el técnico.
- Registro de clientes, equipos y reparaciones con código de seguimiento.
- Búsqueda de clientes por nombre o teléfono.
- Consulta pública del estado y del historial de una reparación.
- Actualización de estado, diagnóstico y costo.
- Archivo de reparaciones, conservando sus datos e historial.
- Validaciones y mensajes de error en español.
- Almacenamiento en PostgreSQL de Supabase mediante una API en Node.js y Express.

## Pendiente

- Agregar las evidencias de funcionamiento a la entrega.
- Actualizar Trello con el estado final del proyecto.
- Preparar pruebas automatizadas de integración con Supabase; las pruebas actuales cubren las validaciones.
- La interfaz no permite restaurar reparaciones archivadas.
