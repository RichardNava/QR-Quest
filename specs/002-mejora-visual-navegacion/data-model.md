# Modelo de datos: Mejora visual y navegación común

## Datos persistentes

**Sin cambios.** Esta funcionalidad no añade, modifica ni elimina tablas, columnas, políticas de acceso, almacenes de archivos ni migraciones. El modelo de datos es el de la [spec 001](../001-qr-quest-v0/data-model.md).

## Conceptos visuales

Son definiciones de presentación, no datos. Los valores concretos están en [research.md](research.md) y las reglas en [contracts/](contracts/).

### Paleta de colores
- **Qué es**: conjunto de 13 colores con nombre semántico, definidos una sola vez en `app/globals.css` y expuestos a Tailwind.
- **Regla**: ningún fichero de la aplicación usa un color que no sea de la paleta (lo comprueba `tests/unit/estilos.test.ts`).

### Navegación común
- **Entradas que decide**: tipo de página (puzzle del jugador / resto) y si hay sesión.
- **Sale**: lista de opciones, opción activa y, en páginas de aventura, segunda fila «Editar · Rejilla».
- **No guarda estado propio**.

### Estado visual
- **Puzzle** (derivado de lo que ya se conoce en pantalla): `sin resolver`, `resuelto`, `error de contraseña`, `incompleto` (solo master).
- **Imagen**: `normal`, `difuminada`, `rompecabezas sin resolver`, `rompecabezas resuelto`.
- **Transiciones**: las que ya existen (acertar la contraseña, revelar la imagen, completar el rompecabezas). No se añade ninguna.
