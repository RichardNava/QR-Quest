# Contratos de interfaz: QR Quest v0

La app no expone una API REST pública. Las interfaces son las **rutas de la web** y **una acción de servidor** para el jugador. Todo lo demás (zona master) usa el cliente de Supabase protegido por RLS.

## Rutas

| Ruta | Acceso | Qué hace |
|---|---|---|
| `/` | público | Portada con enlaces a entrar y registrarse |
| `/registro` | público | Alta con correo y contraseña; entra directamente |
| `/entrar` | público | Inicio de sesión |
| `/recuperar` | público | Pide el correo y envía el enlace de restablecimiento |
| `/restablecer` | enlace del correo | Fija la nueva contraseña |
| `/aventuras` | master | Lista, crea y elimina aventuras |
| `/aventuras/[id]` | master dueño | Edita puzzles, elementos y orden; sube imágenes |
| `/aventuras/[id]/rejilla` | master dueño | Rejilla imprimible de QR |
| `/p/[token]` | público con token válido | Enunciado del puzzle y formulario de contraseña |

Comportamientos:
- `/aventuras/*` sin sesión → redirige a `/entrar`. Una aventura ajena → "no encontrada" (RLS devuelve vacío).
- `/p/[token]` con token inexistente (puzzle o aventura borrados, o dirección inventada) → mensaje amable "Este puzzle ya no existe", con el mismo resultado para tokens borrados y nunca creados (no revela cuáles existieron). No hay ninguna ruta pública que liste puzzles ni acepte un número de orden.
- Todos los textos en español de España.

## Contenido de `/p/[token]` (lo que recibe el navegador del jugador)

Enviado: título, textos e imágenes del **enunciado** (enlaces firmados).
**No** enviado: contraseña, elementos de recompensa.

## Acción de servidor `comprobarContrasena`

**Entrada**: `token` (texto), `intento` (texto, el que escribe el jugador).

**Salida**:

```text
{ ok: true,  recompensa: [ { tipo: "texto", texto } | { tipo: "imagen", url, modo } ... ] }
{ ok: false, mensaje: "Esa no es la contraseña. ¡Inténtalo de nuevo!" }
{ ok: false, mensaje: "Este puzzle ya no existe." }
```

Reglas:
- `intento` y la contraseña guardada se normalizan igual (recortar, minúsculas, sin tildes) antes de comparar.
- Sin límite de intentos. No se registra nada del intento.
- `recompensa` se ordena por `posicion`; las URL de imagen son firmadas y caducan en 1 h.
- Un `modo` distinto de `normal` se aplica solo a imágenes.

## Interfaz de impresión

`/aventuras/[id]/rejilla` genera, por cada puzzle en orden, un QR (SVG) que apunta a `<origen>/p/<token>` con una etiqueta "<Nombre de la aventura> · Puzzle N". El CSS de impresión reparte la cuadrícula en páginas sin partir ningún QR. Se imprime con el diálogo del navegador.
