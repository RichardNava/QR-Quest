# Modelo de datos: Generador automático de puzzles

Una sola columna nueva. No hay tablas nuevas y los puzzles existentes no cambian (`minijuego` es `null`).

```text
puzzles (existente) ── minijuego jsonb null
```

## puzzles.minijuego

| Campo | Tipo | Notas |
|---|---|---|
| minijuego | jsonb, nulo | `null` = el puzzle no tiene minijuego |

Forma cuando no es nulo (ver [contracts/minijuego.md](contracts/minijuego.md)):

```json
{ "tipo": "rushhour", "nivel": "medio", "semilla": 2891736402 }
```

| Clave | Valores | Notas |
|---|---|---|
| tipo | `rushhour` \| `lightsout` \| `mastermind` \| `sudoku` \| `laberinto` | |
| nivel | `facil` \| `medio` \| `dificil` | |
| semilla | entero 0 … 4 294 967 295 | creada en el servidor; nunca se envía al jugador |

### Reglas de validación

- Restricción SQL (`CHECK` `puzzles_minijuego_valido`): `minijuego is null or (minijuego ->> 'tipo' in (...) and minijuego ->> 'nivel' in (...) and jsonb_typeof(minijuego -> 'semilla') = 'number')`. El rango exacto de la semilla (0 … 4 294 967 295) lo valida la acción de servidor.
- La semilla y la forma exacta las valida la acción de servidor antes de guardar (no se confía en el navegador).
- Un puzzle con `minijuego` no nulo **debe** tener `contrasena` no vacía (RF-011): lo exigen las acciones `guardarMinijuego` y `actualizarPuzzle`.
- Máximo un minijuego por puzzle (la propia columna lo garantiza).

### Derivados (no se guardan)

| Dato | Cómo se obtiene |
|---|---|
| Tablero inicial | `generar(tipo, nivel, semilla)`, determinista |
| Solución / código secreto | del mismo generador, solo en el servidor |
| Vista pública | tablero inicial sin solución ni semilla |

## Seguridad

- La columna hereda la política RLS `puzzles_master` (solo el master propietario la lee y la modifica).
- El jugador nunca lee tablas: la página `/p/[token]` y las acciones usan la clave de servicio en el servidor, consultan por token y **nunca** devuelven `contrasena` ni `semilla`.
- Sigue sin guardarse nada de los jugadores (ni progreso, ni intentos, ni tiempos).

## Transiciones de estado

Solo del lado del master (persistentes): `sin minijuego` → `guardarMinijuego` → `con minijuego` → (`guardarMinijuego` de nuevo cambia tipo/nivel/semilla) → `quitarMinijuego` → `sin minijuego`.

Solo en el navegador del jugador (se pierden al recargar): `sin resolver` → (movimientos) → `resuelto` (servidor devuelve contraseña). Mastermind: `sin resolver` ⇄ intentos → `resuelto` o `intentos agotados` → «Reintentar» → `sin resolver`.

## Migración `0003_minijuego.sql`

Añadir la columna y la restricción `CHECK` descritas; sin datos que migrar. Es reversible quitando la columna.
