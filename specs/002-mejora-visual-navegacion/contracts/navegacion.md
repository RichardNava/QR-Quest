# Contrato de interfaz: Navegación común

Define qué ve cada persona en la barra superior. Cubre FR-001 a FR-007.

## Comportamiento por dirección y estado

| Dirección | Estado | Fila principal | Segunda fila |
|---|---|---|---|
| `/p/…` (puzzle y «ya no existe») | cualquiera | Marca «QR Quest» → `/` | — |
| `/`, `/entrar`, `/registro`, `/recuperar`, `/restablecer`, página «no encontrada» | sin sesión | Marca · Entrar · Crear cuenta | — |
| Las mismas | con sesión | Marca · Mis aventuras · Cerrar sesión | — |
| `/aventuras` | con sesión | Marca · **Mis aventuras** (activa) · Cerrar sesión | — |
| `/aventuras/<id>` | con sesión | Marca · Mis aventuras · Cerrar sesión | **Editar** (activa) · Rejilla |
| `/aventuras/<id>/rejilla` | con sesión | Marca · Mis aventuras · Cerrar sesión | Editar · **Rejilla** (activa) |

- La marca enlaza siempre a `/` (la portada ya redirige visualmente según la sesión, sin cambios).
- Las rutas de la tabla son las existentes; no se crea ninguna.

## Reglas visuales y de uso

1. Barra fija en la parte superior de la página, con fondo `marca-oscura` y texto `superficie` (contraste 7,6:1).
2. Sección activa: texto en negrita + subrayado `acento` (no depende solo del color) y `aria-current="page"`.
3. Áreas de pulsación de al menos 44 × 44 px; sin desplazamiento horizontal desde 320 px.
4. Nombre de aventura largo: la barra no muestra el nombre, por lo que no se rompe.
5. Etiquetas en español de España: «Mis aventuras», «Cerrar sesión», «Entrar», «Crear cuenta», «Editar», «Rejilla».
6. Clase `no-imprimir`: la barra no sale en papel (FR-007).
7. Navegable con teclado, con foco visible y contenedor `<nav>` con `aria-label="Principal"` (y «De la aventura» en la segunda fila).

## Garantías de seguridad

- En `/p/…` la barra no incluye enlaces de cuenta ni de gestión y no recibe datos de la aventura.
- «Cerrar sesión» mantiene exactamente el comportamiento actual (cierra sesión y vuelve a la portada).
