# Contrato: acciones de servidor

Convención de la spec 001: acciones `"use server"`; el master usa el cliente de servidor con su sesión (RLS), el jugador usa la clave de servicio consultando por `token`. Todos los mensajes en español de España.

## Master (en `app/aventuras/[id]/actions.ts`)

### `guardarMinijuego(puzzleId, aventuraId, tipo, nivel)` → `Resultado`

- Requiere sesión de master propietario (RLS).
- Error `«Define primero la contraseña del puzzle.»` si `contrasena` está vacía (RF-011).
- Crea una semilla nueva. Si ya había minijuego del mismo tipo y nivel, repite hasta 10 veces hasta que su huella (vista pública y, en Mastermind, también el código secreto) difiera de la anterior; en otro caso, basta una semilla.
- Guarda `{ tipo, nivel, semilla }` en `puzzles.minijuego` y refresca la página.
- Rechaza `tipo` fuera de `TIPOS_DISPONIBLES` (`lib/minijuegos/config.ts`) y `nivel` fuera de `facil`/`medio`/`dificil`.

### `quitarMinijuego(puzzleId, aventuraId)` → `Resultado`

Pone `minijuego = null`. El puzzle sigue funcionando con su contraseña.

### `actualizarPuzzle(...)` (existente, ampliada)

Si el puzzle tiene minijuego y la nueva `contrasena` queda vacía tras `trim()`, devuelve error `«Un puzzle con minijuego necesita contraseña.»` y no guarda.

## Jugador (en `app/p/[token]/actions.ts`)

Sin sesión. Consultan `puzzles` por `token`; si no existe: `{ ok: false, mensaje: "Este puzzle ya no existe." }`.

### `resolverMinijuego(token, respuesta)` → `{ ok: true; contrasena: string } | { ok: false; mensaje: string }`

- Aplica a rushhour, lightsout, sudoku y laberinto. Reconstruye el tablero desde la semilla y verifica la `respuesta` ([minijuego.md](minijuego.md)).
- Si el puzzle no tiene minijuego o es de Mastermind: `{ ok: false, mensaje: "Este puzzle no se resuelve así." }`.
- Respuesta mal formada o por encima de los límites: `{ ok: false, mensaje: "La solución no es válida." }`.
- Solución incorrecta: `{ ok: false, mensaje: "Todavía no está resuelto." }`.
- Solución correcta: devuelve `contrasena` tal como la definió el master (RF-009).

### `probarCodigo(token, codigo)` → `{ ok: true; resuelto: false; pistas } | { ok: true; resuelto: true; contrasena: string } | { ok: false; mensaje: string }`

- Solo Mastermind. Valida longitud y rango de `codigo`.
- Calcula `pistas` frente al código secreto derivado de la semilla. Si el código es exacto, `resuelto: true` y la contraseña.
- Nunca devuelve el código secreto, ni siquiera al fallar el último intento.

## Página del jugador (`/p/[token]`)

- `select("id, titulo, minijuego")` (jamás `contrasena`, sigue sin seleccionarse).
- Calcula la vista pública en servidor y pasa a `<Minijuego>` solo `{ tipo, nivel, vista }`; **no** pasa `semilla`.
- Orden en pantalla: título, contenido del enunciado, minijuego (si existe), formulario de contraseña.

## Editor del master

- `SelectorMinijuego` muestra, en la sección «Enunciado» junto a «Añadir texto» y a la subida de imagen, el botón «Añadir minijuego» (solo si el puzzle no tiene ya uno). Tras guardar, muestra una vista previa jugable con «Generar de nuevo» (llama a `guardarMinijuego` con el mismo tipo y nivel), cambio de tipo/nivel y «Quitar minijuego».
- Un puzzle con minijuego y contraseña vacía muestra aviso y la insignia «Incompleto», como ya ocurre sin contraseña.
