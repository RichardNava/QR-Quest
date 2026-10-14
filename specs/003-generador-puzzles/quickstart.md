# Guía de validación: Generador automático de puzzles

Sirve para comprobar de principio a fin que la funcionalidad cumple la [spec](spec.md). Las comprobaciones 1–7 las puede hacer una persona sin conocimientos técnicos usando solo la aplicación.

## Requisitos previos

- Aplicación en marcha (`npm run dev`) con Supabase configurado como en la spec 001.
- Migración `0003_minijuego.sql` aplicada.
- Un master con una aventura de al menos 2 puzzles, cada uno con contraseña y recompensa.
- Un móvil (o el navegador a 320 px de ancho) y un ordenador.

## Pruebas automáticas

```bash
npm test
```

Esperado: todos los tests pasan, incluidas las de `tests/unit/minijuegos/`: por cada tipo y nivel, 100 generaciones resolubles; Sudoku con solución única; misma semilla = mismo tablero; semillas distintas = huellas distintas (en Mastermind, código secreto distinto); el verificador rechaza respuestas incorrectas; cada generación dentro de presupuesto de tiempo (CE-002, CE-003).

## Escenarios manuales

1. **Añadir minijuego (Historia 1)**: en el editor de un puzzle, pulsar «Añadir minijuego», elegir «Laberinto» y «Fácil». Esperado: aparece un laberinto jugable en menos de 2 s, con «Generar de nuevo» y «Quitar minijuego» (CE-001, CE-003).
2. **Regenerar y guardar**: pulsar «Generar de nuevo»; el laberinto cambia. Recargar la página; el laberinto es el mismo que se dejó (RF-006).
3. **Contraseña obligatoria**: en un puzzle sin contraseña, intentar añadir un minijuego. Esperado: aviso «Define primero la contraseña del puzzle.» y no se añade (RF-011). Con minijuego ya puesto, vaciar la contraseña: se rechaza.
4. **Jugar cada tipo (Historia 2)**: añadir uno de cada (Rush Hour, Lights Out, Mastermind, Sudoku, Laberinto) a puzzles distintos, abrir cada puzzle por su QR/enlace como jugador (sin sesión) y resolverlo. Esperado en todos: mensaje de éxito y contraseña visible; escribirla en el campo muestra la recompensa (CE-004, CE-006). Cronometrar el nivel Fácil (CE-004).
5. **La contraseña no se filtra (RF-008)**: antes de resolver, comprobar que la contraseña no aparece en pantalla ni en «Ver código fuente» ni en la pestaña Red del navegador, y que tampoco aparece una semilla ni una solución. Forzar un envío falso («ya lo he resuelto») no la devuelve (CE-005).
6. **Sin jugar (RF-010)**: en un puzzle con minijuego, escribir directamente la contraseña correcta. Esperado: se ve la recompensa.
7. **Recargar y reiniciar (RF-012)**: a mitad de partida, pulsar «Reiniciar» (vuelve al inicio) y luego recargar (mismo tablero, sin resolver). Mastermind: agotar los intentos y pulsar «Reintentar».
8. **Dificultades (Historia 3)**: generar un Sudoku en fácil, medio y difícil. Esperado: cada vez menos casillas dadas. Igual con tamaño de Laberinto/Lights Out, longitud de Mastermind y número de movimientos de Rush Hour.
9. **Móvil y teclado**: a 320 px no hay scroll horizontal y todos los controles se pulsan con el dedo; el laberinto también responde a las flechas del teclado (CE-006).
10. **Compatibilidad (RF-016, CE-009)**: abrir un puzzle creado antes de esta funcionalidad (sin minijuego) y la rejilla de QR. Esperado: todo funciona y se ve como antes.
11. **Contraseña cambiada**: cambiar la contraseña de un puzzle con minijuego y resolverlo; se muestra la nueva.

## Criterios de salida

- Los tests pasan, los 11 escenarios dan el resultado esperado y `npm run build` termina sin errores.
