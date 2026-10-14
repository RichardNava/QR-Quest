# Investigación: Generador automático de puzzles

No quedaban marcadores «NEEDS CLARIFICATION» en la spec; las decisiones siguientes resuelven cómo construirlo.

## 1. Qué se guarda de un minijuego

- **Decisión**: guardar solo `{ tipo, nivel, semilla }` y recalcular el tablero con un generador determinista.
- **Razón**: cumple RF-006 (mismo tablero siempre) sin guardar tableros; regenerar = cambiar la semilla; el servidor puede reconstruir la solución para verificar sin que viaje al navegador.
- **Alternativas**: guardar el tablero y la solución completos en JSON (más datos, más riesgo de filtrarlos, nada que ganar); generar en el navegador al abrir (no sería idéntico entre jugadores ni verificable).

## 2. Cómo se impide ver la contraseña sin resolver (RF-008)

- **Decisión**: la contraseña no se envía nunca con la página. El navegador recibe el tablero inicial (sin solución ni semilla). Al terminar envía su resolución a una acción de servidor, que reconstruye el tablero desde la semilla, verifica y solo entonces devuelve la contraseña.
- **Razón**: es la única forma en que «inspeccionar la página» no sirva. Reutiliza el patrón de la spec 001 (`comprobarContrasena`: servidor con clave de servicio, consulta por token, nunca se selecciona `contrasena` en la página).
- **Alternativas**: validar en el navegador y enviar la contraseña cifrada (la clave de descifrado también estaría en el navegador); sesión de juego en el servidor con estado (más tablas y viola «no guardar nada del jugador»).

## 3. Qué verifica el servidor en cada tipo

| Tipo | El navegador recibe | El navegador envía | El servidor comprueba |
|---|---|---|---|
| Rush Hour | piezas, tamaño, salida | lista de movimientos (pieza, desplazamiento) | cada movimiento es legal desde el tablero inicial y la pieza objetivo llega a la salida |
| Lights Out | tablero inicial | casillas pulsadas | aplicar las pulsaciones deja todo apagado |
| Mastermind | parámetros (longitud, símbolos, intentos) | **cada intento** | calcula las pistas con el código secreto (derivado de la semilla); si el intento es el código devuelve la contraseña |
| Sudoku | cuadrícula con huecos | cuadrícula completa | coincide con la solución única derivada de la semilla |
| Laberinto | paredes, inicio y meta | lista de movimientos | ningún movimiento atraviesa una pared y termina en la meta |

Mastermind es el único donde el navegador no puede conocer la solución jamás; por eso comprueba intento a intento en el servidor. No hay límite de intentos en el servidor (no se guarda nada del jugador, RF-012); un jugador podría probar combinaciones por fuerza bruta, que es exactamente resolver el juego, igual que probar contraseñas en la spec 001. Aceptado.

## 4. Generación determinista

- **Decisión**: PRNG propio mulberry32 (unas 8 líneas), semilla de 32 bits creada con `crypto` en el servidor.
- **Razón**: simple, sin dependencia, mismo resultado en servidor y pruebas.
- **Alternativas**: `Math.random` (no reproducible); librería `seedrandom` (dependencia innecesaria).

## 5. Algoritmo de cada tipo

- **Rush Hour** (6×6): colocar la pieza objetivo (2 casillas, fila 3, horizontal) y entre 7 y 12 vehículos aleatorios de longitud 2 o 3; **BFS** sobre estados para hallar el mínimo de movimientos; repetir hasta alcanzar el mínimo del nivel (fácil ≥ 6, medio ≥ 14, difícil ≥ 22; se afinará con las pruebas) con un tope de intentos, quedándose con el mejor. El BFS demuestra la resolubilidad. Un «movimiento» es deslizar una pieza cualquier número de casillas.
- **Lights Out**: partir del tablero apagado y aplicar pulsaciones aleatorias; el estado resultante es resoluble por construcción. Tamaños 3×3, 4×4 y 5×5, con número de pulsaciones creciente. Si sale todo apagado, se repite.
- **Mastermind**: código secreto aleatorio. Fácil: 4 posiciones, 6 símbolos, sin repetidos, 10 intentos. Medio: 4, 6, con repetidos, 10. Difícil: 5, 8, con repetidos, 12. Pistas: «en su sitio» y «en otro sitio». Los símbolos se distinguen por forma/letra además del color (RF-014).
- **Sudoku** (9×9): rellenar una solución con backtracking y orden aleatorio con semilla; quitar casillas en orden aleatorio comprobando con un contador de soluciones (tope 2) que sigue siendo única. Pistas objetivo: fácil 40, medio 32, difícil 26 (se detiene al no poder quitar más).
- **Laberinto**: cuadrícula con **retroceso recursivo (DFS)**, resultando en un laberinto perfecto (un único camino). Tamaños 8×8, 12×12 y 16×16. Inicio arriba a la izquierda, meta abajo a la derecha. Se implementa con pila, no recursión, para evitar desbordes de pila.
- **Alternativas**: Rush Hour por movimientos inversos desde el estado resuelto (no controla bien la dificultad); Kruskal/Prim para el laberinto (sin ventaja visible); Sudoku por plantillas fijas barajadas (menos variado).

## 6. «Generar de nuevo» distinto

Nueva semilla; si la **huella** resultante (la vista pública y, en Mastermind, también el código secreto, porque su vista es idéntica para todas las semillas) es igual a la actual, se repite hasta 10 veces. En Lights Out 3×3 (solo 512 estados) puede haber coincidencias, y el tope de 10 reintentos las absorbe. Cubre el escenario 3 de la historia 1.

## 7. Modelo: columna o elemento

- **Decisión**: columna `puzzles.minijuego jsonb` nula.
- **Razón**: solo se permite uno por puzzle (RF-005); no toca la posición, el modo ni el límite de imágenes de `elementos`; los puzzles antiguos quedan con `null` y funcionan igual (RF-016).
- **Alternativa**: nuevo `tipo = 'minijuego'` en `elementos` (obligaría a reabrir restricciones SQL y la ordenación para un caso de uso de uno por puzzle).

## 8. Reglas de contraseña (RF-011)

La acción de guardar el minijuego rechaza un puzzle sin contraseña, y `actualizarPuzzle` rechaza dejar vacía la contraseña si hay minijuego. La interfaz lo muestra como aviso en el editor; la regla real vive en las acciones de servidor.

## 9. Interfaz y accesibilidad

- Todo se controla con toques/clics; tamaño mínimo de objetivo táctil 44 px; el tablero escala con el ancho (`max-w-full`, unidades relativas) hasta 320 px. Laberinto: cruceta en pantalla más teclas de flecha.
- Estados con texto («Sin resolver», «¡Resuelto!», «Esa combinación no es correcta») y no solo color (RF-014); Mastermind y Lights Out usan símbolos/forma, y la insignia existente (`components/Insignia.tsx`) para los estados.
- Rush Hour: arrastrar con puntero o, alternativamente, seleccionar pieza y pulsar flechas; evita depender del arrastre fino en móvil. Se elige seleccionar + botones por ser más fiable que arrastrar.
- Cada tipo muestra un párrafo «Cómo se juega» (RF-015) y un botón «Reiniciar» (RF-012).
