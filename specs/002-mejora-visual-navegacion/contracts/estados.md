# Contrato de interfaz: Estados visuales

Cada estado se refuerza con **icono + texto + color** (FR-015). Cubre FR-013 y FR-014.

## Insignia

Etiqueta pequeña (`Insignia`) con icono a la izquierda y texto. Variantes: `exito`, `peligro`, `aviso`, `neutra`.

## Puzzle

| Estado | Dónde | Aspecto | Texto |
|---|---|---|---|
| Sin resolver | Jugador | Tarjeta normal con formulario de contraseña | «Contraseña» (sin cambios) |
| Error de contraseña | Jugador | Aviso `peligro-suave` con icono ✕ bajo el campo | Mensaje existente |
| Resuelto | Jugador | Cabecera `exito` con icono ✓ y recompensa en panel `exito-suave` | «¡Correcto!» / «¡Fin de la aventura!» (sin cambios) |
| Completo | Master (editor) | Insignia `exito` ✓ | «Completo» |
| Incompleto | Master (editor) | Insignia `aviso` ⚠ y borde `acento` en la tarjeta | «Incompleto» |

«Incompleto» usa solo condiciones que la aplicación ya valida: contraseña vacía, o recompensa sin ningún texto ni imagen. No se añade ninguna regla nueva.

## Imagen

| Estado | Dónde | Aspecto | Texto |
|---|---|---|---|
| Normal | Editor | Insignia `neutra` | «Normal» |
| Difuminada | Editor | Insignia `aviso` | «Difuminada» |
| Rompecabezas | Editor | Insignia `aviso` | «Rompecabezas» |
| Difuminada, sin revelar | Jugador | Imagen desenfocada con borde `acento` y insignia | «Difuminada · pulsa para revelar» |
| Difuminada, revelada | Jugador | Imagen nítida, sin insignia de aviso | — |
| Rompecabezas, por resolver | Jugador | Cuadrícula con borde `acento`, hueco de destino resaltado con borde `marca` al arrastrar, insignia | «Rompecabezas · por resolver» |
| Rompecabezas, resuelto | Jugador | Imagen completa con insignia `exito` ✓ | «Recompuesto» |

## Reglas comunes

- Los cambios de estado son los que ya existen; solo cambia cómo se ven.
- Todos los textos de estado en español de España.
- Contraste mínimo 4,5:1 en todas las insignias (ver [research.md](../research.md)).
- Las insignias no ocupan lugar en la impresión de la rejilla (no aparecen allí).
