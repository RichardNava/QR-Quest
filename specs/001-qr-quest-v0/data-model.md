# Modelo de datos: QR Quest v0

Tres tablas propias. El master no necesita tabla: es el usuario de Supabase Auth (`auth.users`: correo y contraseña, nada más, RF-001).

```text
auth.users (Master) 1 ──< aventuras 1 ──< puzzles 1 ──< elementos
```

## aventuras

| Campo | Tipo | Notas |
|---|---|---|
| id | uuid, PK | |
| master_id | uuid → auth.users, borrado en cascada | propietario |
| nombre | texto, obligatorio | no vacío |
| creada_en | timestamptz | |

## puzzles

| Campo | Tipo | Notas |
|---|---|---|
| id | uuid, PK | |
| aventura_id | uuid → aventuras, borrado en cascada | |
| posicion | entero | orden en la cadena; el de mayor posición es el último (su recompensa es el mensaje de final) |
| token | texto, único, obligatorio | aleatorio de 128 bits, generado al crear y **nunca modificable**; es lo que codifica el QR |
| titulo | texto | opcional |
| contrasena | texto | obligatoria para poder generar la rejilla |

Reglas:
- Reordenar solo cambia `posicion`; `token` no se toca (RF-009).
- Borrar un puzzle borra su fila: su token deja de existir y `/p/<token>` muestra "ya no existe".
- La rejilla no se genera si la aventura no tiene puzzles o alguno no tiene contraseña (casos límite).

## elementos

Textos e imágenes de un puzzle, tanto del enunciado como de la recompensa.

| Campo | Tipo | Notas |
|---|---|---|
| id | uuid, PK | |
| puzzle_id | uuid → puzzles, borrado en cascada | |
| parte | `enunciado` \| `recompensa` | dónde se muestra |
| posicion | entero | orden dentro de su parte |
| tipo | `texto` \| `imagen` | |
| texto | texto | obligatorio si tipo = texto |
| ruta_imagen | texto | ruta en el bucket; obligatoria si tipo = imagen |
| modo | `normal` \| `difuminado` \| `rompecabezas` | solo para imágenes de la recompensa; por defecto `normal` |

Reglas de validación:
- Una recompensa debe tener **al menos un elemento** (RF-004); la interfaz lo exige y la rejilla no se genera sin ello.
- `modo` distinto de `normal` solo es válido con `parte = recompensa` y `tipo = imagen` (CHECK en SQL).
- **Máximo 40 imágenes por aventura** (RF-015): disparador `BEFORE INSERT OR UPDATE OF tipo` que cuenta las demás filas `tipo = imagen` de la aventura (vía `puzzles`, excluyendo la propia fila) y rechaza la 41.ª con un mensaje claro; así cambiar un elemento de texto a imagen tampoco salta el límite.
- **Máximo 4 MB por imagen** y solo tipos `image/*`: límite del bucket en Supabase Storage.

## Almacén de imágenes

Bucket privado `imagenes`; ruta `"<master_id>/<aventura_id>/<uuid>.<ext>"`.
- El master solo puede subir, leer y borrar bajo su propia carpeta (política de Storage por `auth.uid()`).
- El jugador no tiene acceso directo: el servidor genera enlaces firmados de corta duración (1 h) y solo del puzzle consultado.
- Al borrar un elemento, puzzle o aventura desde la interfaz, la acción también elimina los archivos asociados.

## Seguridad (RLS activada en las tres tablas)

| Tabla | Master autenticado | Anónimo (jugador) |
|---|---|---|
| aventuras | CRUD solo si `master_id = auth.uid()` | sin acceso |
| puzzles | CRUD solo si su aventura es suya | sin acceso |
| elementos | CRUD solo si su puzzle es suyo | sin acceso |

Los jugadores **nunca** leen tablas directamente: la página `/p/[token]` y la acción de comprobación usan la clave de servicio, solo en servidor, y consultan *por token*. De esta forma `contrasena` y los elementos de recompensa no son accesibles desde el navegador del jugador.

## Qué NO se guarda (RF-013)

Ningún dato de jugadores: ni progreso, ni intentos, ni tiempos, ni identificadores. Recargar la página devuelve el puzzle al inicio.

## Transiciones de estado

No hay estados persistentes. Estado solo en el navegador del jugador, que se pierde al recargar: `enunciado` → (contraseña correcta) → `recompensa visible`; con rompecabezas: `piezas barajadas` → `resuelto` → pista visible.
