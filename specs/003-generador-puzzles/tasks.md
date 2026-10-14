---

description: "Lista de tareas: Generador automático de puzzles"
---

# Tareas: Generador automático de puzzles

**Entrada**: documentos de diseño en `/specs/003-generador-puzzles/`

**Requisitos previos**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

**Pruebas**: el plan fija pruebas de Vitest para la lógica pura de los generadores y verificadores (CE-002, CE-003, RF-004, RF-008). No se escriben pruebas de interfaz; esas se comprueban con el [quickstart.md](quickstart.md).

**Alcance**: SOLO lo escrito en la spec (constitución III). Sin dependencias nuevas, sin rutas nuevas, sin cambios en `elementos`, recompensas, QR ni imágenes (RF-016). Todos los textos en español de España.

**Reglas que no se pueden romper**: la contraseña (`contrasena`), la `semilla`, la solución y el código secreto de Mastermind NUNCA viajan al navegador del jugador antes de resolver (RF-008). La página `/p/[token]` sigue sin seleccionar `contrasena`.

**Paleta**: `tests/unit/estilos.test.ts` (spec 002) prohíbe en `app/` y `components/` cualquier hex, `rgb()` suelto o color de la paleta por defecto de Tailwind. Los tableros usan SOLO los tokens (`papel`, `superficie`, `tinta`, `tinta-suave`, `marca`, `marca-oscura`, `acento`, `acento-suave`, `borde`, `exito`, `peligro`, `noche`…). Las piezas, luces y símbolos se distinguen por **forma, letra, relleno o borde**, no por tonos nuevos.

**Formato**: `[ID] [P?] [Historia] Descripción con ruta`

- **[P]**: se puede hacer en paralelo (ficheros distintos, sin dependencias pendientes)
- **[US1/US2/US3]**: historia de la spec a la que pertenece la tarea

**Orden de trabajo por tipo**: Laberinto es la primera «rebanada» completa (generador + verificador + componente + prueba) porque es la más simple; sirve para validar toda la tubería en US1 y US2. Los otros cuatro tipos se añaden en US2 en paralelo.

---

## Fase 1: Preparación (base compartida)

**Propósito**: datos y piezas puras que usan todas las historias.

- [X] T001 Crear `supabase/migrations/0003_minijuego.sql`: `alter table public.puzzles add column minijuego jsonb;` y una restricción `CHECK` llamada `puzzles_minijuego_valido`: `minijuego is null or (minijuego ->> 'tipo' in ('rushhour','lightsout','mastermind','sudoku','laberinto') and minijuego ->> 'nivel' in ('facil','medio','dificil') and jsonb_typeof(minijuego -> 'semilla') = 'number')`. Columna nula por defecto; sin datos que migrar. No tocar las políticas RLS (`puzzles_master` ya la cubre). Añadir comentario cabecera en español como en `0002_modos_en_enunciado.sql`.
- [X] T002 [P] Crear `lib/minijuegos/tipos.ts` con los tipos exactos de [contracts/minijuego.md](contracts/minijuego.md): `Nivel = "facil" | "medio" | "dificil"`, `TipoMinijuego = "rushhour" | "lightsout" | "mastermind" | "sudoku" | "laberinto"`, `Minijuego = { tipo; nivel; semilla: number }` (semilla "entero 0 … 4 294 967 295"), y por cada tipo su `Vista*`, `Respuesta*` (y, para Mastermind, `IntentoMastermind` y `PistasMastermind`). Añadir `Vista = VistaRushHour | ... ` y `Respuesta = ...` como uniones discriminadas por `tipo`. Añadir en `lib/tipos.ts` el campo `minijuego: Minijuego | null` al tipo `Puzzle` (importándolo de `lib/minijuegos/tipos.ts`).
- [X] T003 [P] Crear `lib/minijuegos/prng.ts`: `crearPrng(semilla: number)` con mulberry32 devolviendo `{ siguiente(): number /* [0,1) */, entero(min, max): number /* ambos incluidos */, barajar<T>(lista: T[]): T[] /* copia, Fisher-Yates con la semilla */ }`; y `nuevaSemilla(): number` que usa `crypto.getRandomValues(new Uint32Array(1))[0]` (Node 20; sin `Math.random`).
- [X] T004 [P] Crear `lib/minijuegos/config.ts` con una tabla `NIVELES` por tipo y nivel, con estos valores iniciales (se afinan en US3): Rush Hour `{ minMovimientos: 6 | 14 | 22, vehiculos: [7, 12], intentosMax: 300 }` para fácil|medio|difícil; Lights Out `{ tamano: 3 | 4 | 5, pulsaciones: 3 | 6 | 10 }`; Mastermind `{ longitud: 4 | 4 | 5, simbolos: 6 | 6 | 8, repetidos: false | true | true, intentos: 10 | 10 | 12 }`; Sudoku `{ pistas: 40 | 32 | 26 }`; Laberinto `{ ancho: 8 | 12 | 16, alto: 8 | 12 | 16 }`. Exportar también `TIPOS_DISPONIBLES: TipoMinijuego[]`, inicialmente `["laberinto"]` (cada tarea de tipo añade el suyo cuando su prueba pasa), y `NOMBRES_TIPO` (`Rush Hour`, `Lights Out`, `Mastermind`, `Sudoku`, `Laberinto`) y `NOMBRES_NIVEL` (`Fácil`, `Medio`, `Difícil`).

---

## Fase 2: Fundamentos (bloquea todas las historias)

**Propósito**: esqueleto sobre el que cuelgan los cinco tipos y las dos pantallas.

**⚠️ CRÍTICO**: ninguna historia puede empezar hasta terminar esta fase.

- [X] T005 Crear `lib/minijuegos/index.ts` y los cinco módulos vacíos `lib/minijuegos/{rushhour,lightsout,mastermind,sudoku,laberinto}.ts`. Cada módulo exporta un objeto con la forma `GeneradorMinijuego`: `vista(nivel, semilla): Vista` (tablero visible, sin solución, sin semilla) y `verificar(nivel, semilla, respuesta: unknown): boolean` (Mastermind exporta además `pistas(nivel, semilla, codigo: number[])`); de momento lanzan `new Error("pendiente")`. `index.ts` exporta `generarVista(m: Minijuego): Vista` y `verificarRespuesta(m: Minijuego, respuesta: unknown): boolean` que despachan por `m.tipo`, `pistasMastermind` y `huella(m: Minijuego): string` (`JSON.stringify` de la vista y, solo para Mastermind, también el código secreto; nunca se envía al navegador). `index.ts` y los cinco módulos de tipo empiezan con `import "server-only";` (el paquete ya está en `package.json`): solo se importan desde el servidor. Los tipos viven en `tipos.ts` y las constantes en `config.ts`, que sí pueden importarse desde el cliente. Depende de T002–T004.
- [X] T006 Crear `components/minijuegos/Minijuego.tsx` (componente de cliente): props `{ tipo, nivel, vista, token }`; muestra título con `NOMBRES_TIPO`, un párrafo «Cómo se juega» por tipo en español de España (breve: objetivo y controles), el tablero (componente del tipo), el botón «Reiniciar» (cambia una `key` para remontar el tablero) y un estado con `Insignia` («Sin resolver» en variante `aviso` y «¡Resuelto!» en variante `exito`, siempre con texto, RF-014). Crear también los cinco componentes vacíos `components/minijuegos/{RushHour,LightsOut,Mastermind,Sudoku,Laberinto}.tsx` (devuelven `null`) para que compile; el `switch` por `tipo` ya los referencia. La conexión con el servidor se hace en US2 (T016). Contrato de props de los tableros: cada uno recibe `{ vista, alTerminar: (respuesta) => void, bloqueado: boolean }` (`bloqueado` es `true` tras «¡Resuelto!» y mientras hay una petición al servidor en curso; el tablero ignora entonces los toques); Mastermind recibe además `probar: (codigo: number[]) => Promise<PistasMastermind | { contrasena: string }>`. El contenedor es el único que llama al servidor y el único que pinta la contraseña. Los componentes de `components/minijuegos/` solo importan `tipos.ts`, `config.ts` y `reglas.ts` de `lib/minijuegos/`, jamás `index.ts` ni los módulos de lógica. `reglas.ts` (añadido en la implementación) reúne las reglas puras que comparten verificadores y tableros —paso en el laberinto, deslizar piezas de Rush Hour, pulsar una luz—, opera solo sobre la vista pública y no contiene soluciones ni semillas. Estilos solo con `components/estilos.ts`; tablero con `max-w-full` y objetivos táctiles de al menos 44 px. Depende de T002.
- [X] T007 [P] Crear `tests/unit/minijuegos/ayudas.ts` con `semillas(n: number): number[]` determinista (p. ej. 1..n multiplicado por un primo) y `porCadaTipoYNivel(fn)` que itera los 5 tipos × 3 niveles; lo usan las pruebas posteriores. Añadir en `vitest.config.ts` un `resolve.alias` de `server-only` a un fichero vacío `tests/unit/minijuegos/server-only-vacio.ts`, porque Vitest corre en Node y ese paquete lanza error fuera de Next.

**Punto de control**: `npm run build` compila con los módulos vacíos.

---

## Fase 3: Historia 1 - El master añade un minijuego generado (Prioridad: P1) 🎯 MVP

**Objetivo**: desde el editor, «Añadir minijuego» genera y guarda un minijuego con vista previa, regenerable y quitable.

**Prueba independiente**: escenarios 1, 2 y 3 del [quickstart.md](quickstart.md), con Laberinto.

- [X] T008 [US1] En `lib/minijuegos/laberinto.ts` implementar `vista` y `verificar`: laberinto perfecto con retroceso recursivo **usando pila, no recursión**, sobre `ancho × alto` de `config.ts`, con el PRNG de la semilla; `paredes.derecha[f][c]` y `paredes.abajo[f][c]` según [contracts/minijuego.md](contracts/minijuego.md); `inicio = {fila:0,col:0}`, `meta = {fila: alto-1, col: ancho-1}`. `verificar` acepta `{ movimientos: ("N"|"S"|"E"|"O")[] }`, rechaza más de 3 000 movimientos o cualquier valor distinto, rehace el laberinto desde la semilla, camina y devuelve `true` solo si ningún paso cruza una pared ni sale del tablero y acaba en `meta`.
- [X] T009 [P] [US1] Crear `tests/unit/minijuegos/laberinto.test.ts`: con `semillas(100)` × 3 niveles, el camino BFS de inicio a meta existe y es único (laberinto perfecto: `ancho*alto - 1` pasillos); `verificar` acepta el camino y rechaza uno que cruza una pared, uno que no llega y uno con más de 3 000 pasos; misma semilla ⇒ misma vista.
- [X] T010 [US1] Implementar `components/minijuegos/Laberinto.tsx`: dibuja la cuadrícula con las paredes (CSS grid, `max-w-full`), ficha, meta con texto accesible; movimiento con una cruceta de 4 botones de al menos 44 px y con las flechas del teclado; registra los movimientos; impide cruzar paredes; llama a `alTerminar({ movimientos })` al llegar a la meta. Texto «Llega a la meta» visible además del icono.
- [X] T011 [US1] En `app/aventuras/[id]/actions.ts` añadir `guardarMinijuego(puzzleId, aventuraId, tipo, nivel)` y `quitarMinijuego(puzzleId, aventuraId)` según [contracts/acciones.md](contracts/acciones.md): validar que `tipo` está en `TIPOS_DISPONIBLES` y que `nivel` es `facil`, `medio` o `dificil` (así un tipo sin generador no se puede guardar); leer `contrasena` y devolver `«Define primero la contraseña del puzzle.»` si está vacía tras `trim()`; semilla nueva con `nuevaSemilla()`; si había minijuego del mismo tipo y nivel, repetir hasta 10 veces mientras `huella(nuevo)` coincida con `huella(anterior)` (la huella incluye el código secreto en Mastermind, cuya vista pública es idéntica para todas las semillas); guardar `{tipo, nivel, semilla}` y `refrescar(aventuraId)`. En `actualizarPuzzle` rechazar, si el puzzle tiene minijuego y `datos.contrasena.trim()` está vacío, con `«Un puzzle con minijuego necesita contraseña.»` sin guardar. Mensajes en español de España; usar `MSG_GENERICO` para errores de base de datos.
- [X] T012 [US1] Crear `components/SelectorMinijuego.tsx` (cliente): botón «Añadir minijuego» que despliega un selector de tipo (solo los de `TIPOS_DISPONIBLES`, con `NOMBRES_TIPO`; en el MVP solo Laberinto) y de nivel (`NOMBRES_NIVEL`) y un botón «Generar»; si ya hay minijuego (props `minijuego`, `vista`, `token`) muestra la vista previa con `<Minijuego>`, cambio de tipo/nivel, «Generar de nuevo» (llama `guardarMinijuego` con el mismo tipo/nivel) y «Quitar minijuego» (con `window.confirm`). Los valores por defecto del selector son Laberinto y Fácil, para poder añadir un minijuego en 2–3 pulsaciones (CE-001). Errores con el estilo `error` de `estilos.ts`. Depende de T006, T011.
- [X] T013 [US1] Integrar en el editor: en `app/aventuras/[id]/page.tsx` calcular `generarVista(puzzle.minijuego)` en servidor para cada puzzle con minijuego y pasar `minijuego`, `vista` y `token` a `components/EditorPuzzle.tsx`; en la sección «Enunciado» de `EditorPuzzle.tsx`, junto a «Añadir texto» y la subida de imagen, pintar `<SelectorMinijuego>` (solo en la parte `enunciado`). Si hay minijuego y la contraseña está vacía, mostrar el aviso y marcar el puzzle como «Incompleto» (la condición `incompleto` ya cubre la contraseña vacía). Dependiente de T008, T010, T012.

**Punto de control**: un master puede añadir, regenerar, guardar y quitar un Laberinto; al recargar, el tablero es el mismo.

---

## Fase 4: Historia 2 - El jugador resuelve el minijuego y obtiene la contraseña (Prioridad: P1)

**Objetivo**: el jugador resuelve el minijuego, el servidor lo verifica y entrega la contraseña; los cinco tipos funcionan.

**Prueba independiente**: escenarios 4–7 y 9 del [quickstart.md](quickstart.md).

### Tubería de servidor y página

- [X] T014 [US2] En `app/p/[token]/actions.ts` añadir `resolverMinijuego(token, respuesta)` y `probarCodigo(token, codigo)` con los resultados exactos de [contracts/acciones.md](contracts/acciones.md): consultar `puzzles` por `token` con `crearClienteAdmin()` seleccionando `id, contrasena, minijuego`; «Este puzzle ya no existe.» si no existe; `resolverMinijuego` devuelve `«Este puzzle no se resuelve así.»` si no hay minijuego o es Mastermind, `«La solución no es válida.»` si la respuesta está mal formada o supera los límites (500 movimientos de Rush Hour, 100 pulsaciones de Lights Out, 3 000 movimientos de Laberinto, Sudoku exactamente 9×9 con 1..9), `«Todavía no está resuelto.»` si `verificarRespuesta` da `false`, y `{ ok: true, contrasena }` si da `true`; `probarCodigo` solo para Mastermind, valida longitud y rango, devuelve `pistas` y solo si el código es exacto `resuelto: true` con la contraseña. Nunca devolver `semilla` ni el código secreto. Envolver todo en `try/catch` para que una respuesta absurda no lance excepción al cliente.
- [X] T015 [US2] En `app/p/[token]/page.tsx` seleccionar `id, titulo, minijuego` (NUNCA `contrasena`), calcular `generarVista(puzzle.minijuego)` en el servidor y pintar `<Minijuego tipo nivel vista token />` entre `ContenidoPuzzle` y `FormularioContrasena`. No pasar la semilla al componente.
- [X] T016 [US2] Conectar `components/minijuegos/Minijuego.tsx` con el servidor: al recibir la solución del tablero (`alTerminar(respuesta)`) llama a `resolverMinijuego(token, respuesta)`; si `ok`, muestra el estado «¡Resuelto!» y un recuadro con «La contraseña es:» + la contraseña bien visible + «Escríbela en el campo de abajo para ver la recompensa» (RF-007); si no, muestra el mensaje con el estilo `aviso`. Mastermind recibe la prop `probar` que envuelve `probarCodigo` (ver T024). «Reiniciar» no pide nada al servidor. Depende de T014.

### Rush Hour

- [X] T017 [P] [US2] Implementar `lib/minijuegos/rushhour.ts`: tablero 6×6 con la pieza objetivo (largo 2, horizontal, fila 2 con índice desde 0) y entre 7 y 12 vehículos de largo 2 o 3, sin solaparse; solucionador **BFS** sobre estados (cada «movimiento» desliza una pieza cualquier número de casillas libres) que devuelve el mínimo de movimientos; repetir generación con el PRNG hasta `minMovimientos` del nivel con tope `intentosMax`, quedándose con el mejor tablero; `vista` según el contrato (`salida: { fila }`); `verificar` acepta `{ movimientos: { id, casillas }[] }` (casillas con signo), máximo 500, comprueba que cada deslizamiento es legal desde el tablero inicial (sin saltar piezas ni salir) y que la pieza objetivo acaba tocando el borde derecho. Cuando su prueba pase, añadir `"rushhour"` a `TIPOS_DISPONIBLES` en `lib/minijuegos/config.ts`.
- [X] T018 [P] [US2] Crear `tests/unit/minijuegos/rushhour.test.ts`: 100 semillas × 3 niveles son resolubles (BFS devuelve solución) y cumplen o se acercan a `minMovimientos`; `verificar` acepta una solución BFS y rechaza movimientos ilegales, piezas inexistentes y un tablero sin resolver.
- [X] T019 [US2] Implementar `components/minijuegos/RushHour.tsx`: tablero 6×6, seleccionar una pieza (toque o clic) y moverla con 4 botones de flecha (o flechas del teclado) una casilla cada vez, solo si está libre; pieza objetivo destacada y rotulada («Tu pieza») con salida señalada; llama a `alTerminar({ movimientos })` agrupando los pasos en `{ id, casillas }` cuando la pieza objetivo alcanza la salida. Depende de T017.

### Lights Out

- [X] T020 [P] [US2] Implementar `lib/minijuegos/lightsout.ts`: parte del tablero apagado de `tamano × tamano` y aplica `pulsaciones` casillas aleatorias (distintas) con el PRNG; si queda todo apagado, repite; `vista` = `{ tamano, encendidas }`; `verificar` acepta `{ pulsadas: {fila,col}[] }` (máximo 100, casillas dentro del tablero), aplica cada pulsación (casilla + vecinas ortogonales) al tablero inicial y devuelve `true` si todo queda apagado. Cuando su prueba pase, añadir `"lightsout"` a `TIPOS_DISPONIBLES` en `lib/minijuegos/config.ts`.
- [X] T021 [P] [US2] Crear `tests/unit/minijuegos/lightsout.test.ts`: tablero resoluble (las pulsaciones usadas en la generación lo resuelven), no está todo apagado al inicio, `verificar` acepta la solución y rechaza una incompleta; pulsar dos veces la misma casilla se anula.
- [X] T022 [US2] Implementar `components/minijuegos/LightsOut.tsx`: cuadrícula de botones de al menos 44 px; encendida = relleno y texto «Encendida», apagada = vacía y «Apagada» (accesible con `aria-label`, no solo color); al pulsar alterna la casilla y las vecinas ortogonales; guarda las pulsaciones; cuando todo está apagado llama a `alTerminar({ pulsadas })`. Depende de T020.

### Mastermind

- [X] T023 [P] [US2] Implementar `lib/minijuegos/mastermind.ts`: secreto de `longitud` valores en `0..simbolos-1` (sin repetidos si `repetidos` es falso) con el PRNG; `vista` = `{ longitud, simbolos, intentos, repetidos }` (NUNCA el secreto); `pistas(nivel, semilla, codigo)` devuelve `{ enSuSitio, enOtroSitio }` con el cálculo estándar que cuenta bien los repetidos; `verificar` acepta `{ codigo }` y devuelve `true` si coincide con el secreto. Cuando su prueba pase, añadir `"mastermind"` a `TIPOS_DISPONIBLES` en `lib/minijuegos/config.ts`.
- [X] T024 [US2] Implementar `components/minijuegos/Mastermind.tsx`: ranuras con selector de símbolo (cada símbolo con **forma y letra**, p. ej. ●▲■◆★✚ y A–H, coloreado solo con tokens de la paleta; nunca por color únicamente), historial de intentos con sus pistas («en su sitio» / «en otro sitio» en texto), contador «Intento n de N»; cada intento se envía con la prop `probar(codigo)` (el contenedor la conecta a `probarCodigo(token, codigo)`; no se modifica `Minijuego.tsx`); si la respuesta trae la contraseña, el contenedor la muestra; al agotar intentos muestra «Se han acabado los intentos» y el botón «Reintentar» (limpia el historial, mismo tablero). Depende de T014, T023.
- [X] T025 [US2] Crear `tests/unit/minijuegos/mastermind.test.ts`: `vista` no contiene el secreto; `pistas` correctas en casos con repetidos (p. ej. secreto `[1,1,2,3]` frente a `[1,2,1,1]`); sin repetidos en fácil; `verificar` solo acepta el secreto. Depende de T023.

### Sudoku

- [X] T026 [P] [US2] Implementar `lib/minijuegos/sudoku.ts`: solución 9×9 por backtracking con orden de candidatos aleatorio con el PRNG; quitar casillas en orden aleatorio mientras el **contador de soluciones** (con tope 2, heurística de casilla con menos candidatos) siga dando exactamente 1, hasta dejar `pistas` casillas (o las que se pueda); `vista` = `{ casillas: (number|null)[][] }`; `verificar` acepta `{ casillas: number[][] }` exactamente 9×9 con valores 1..9 y devuelve `true` si coincide con la solución derivada de la semilla. Cuando su prueba pase, añadir `"sudoku"` a `TIPOS_DISPONIBLES` en `lib/minijuegos/config.ts`.
- [X] T027 [P] [US2] Crear `tests/unit/minijuegos/sudoku.test.ts`: 100 semillas × 3 niveles tienen **solución única** (contador independiente en el test) y las pistas dadas son ≥ `pistas` del nivel + 5 de margen para difícil; la vista respeta la solución; `verificar` acepta la solución y rechaza una cuadrícula con un valor cambiado, de tamaño erróneo o con valores fuera de rango.
- [X] T028 [US2] Implementar `components/minijuegos/Sudoku.tsx`: cuadrícula 9×9 con casillas dadas fijas (distinto estilo y no editables), selección de casilla por toque y teclado numérico en pantalla de 1–9 y borrar (botones ≥ 44 px, la cuadrícula escala sin desbordar a 320 px); sin ayudas de juego añadidas (nada fuera de la spec); botón «Comprobar» que, al estar completa, llama a `alTerminar({ casillas })`; si el servidor responde «Todavía no está resuelto.» se muestra el mensaje. Depende de T026.

### Seguridad

- [X] T029 [US2] Crear `tests/unit/minijuegos/vista-publica.test.ts`: para cada tipo, `JSON.stringify(generarVista(...))` no contiene la clave `semilla` ni el valor de la semilla como número, y la vista de Mastermind no contiene el secreto ni ningún campo `secreto`/`codigo`. Además, una prueba de texto que lea `app/p/[token]/page.tsx` y falle si su `select(` incluye `contrasena` (RF-008), y otra que lea `components/minijuegos/*.tsx` y `components/SelectorMinijuego.tsx` y falle si importan algo de `lib/minijuegos/` distinto de `tipos`, `config` o `reglas`. Depende de T005 y de los generadores T008, T017, T020, T023, T026.

**Punto de control**: los cinco tipos se completan en el navegador y entregan la contraseña; los escenarios 4–7 y 9 del quickstart pasan.

---

## Fase 5: Historia 3 - Variedad, resolubilidad y dificultad (Prioridad: P2)

**Objetivo**: asegurar con medición que los niveles se notan y que todo es resoluble y rápido.

**Prueba independiente**: escenario 8 del [quickstart.md](quickstart.md) y las pruebas de esta fase.

- [X] T030 [US3] Ajustar `lib/minijuegos/config.ts` con lo medido por las pruebas: los umbrales de Rush Hour (`minMovimientos`), las `pistas` de Sudoku y las `pulsaciones` de Lights Out deben alcanzarse en ≥ 95 % de las semillas probadas y producir un orden estricto fácil < medio < difícil en la métrica de cada tipo.
- [X] T031 [P] [US3] Crear `tests/unit/minijuegos/dificultad.test.ts`: con `semillas(30)`, la media de la métrica de dificultad crece de fácil a medio a difícil para: movimientos mínimos (Rush Hour), casillas vacías (Sudoku), casillas del tablero (Laberinto y Lights Out) y combinaciones posibles (Mastermind: `simbolos ** longitud`).
- [X] T032 [P] [US3] Crear `tests/unit/minijuegos/generacion.test.ts`: por `porCadaTipoYNivel`, 100 semillas: misma semilla ⇒ misma vista (determinismo, RF-006); semillas distintas ⇒ `huella` distinta (en Mastermind la vista es igual para todas las semillas, por eso se compara la huella, que incluye el secreto) salvo en Lights Out 3×3 (que solo tiene 512 estados; allí se exige ≥ 50 huellas distintas entre 100); la vista no es la solución trivial (Lights Out con alguna encendida; Laberinto con inicio ≠ meta). Cubre CE-002 y la historia 3.
- [X] T033 [P] [US3] Crear `tests/unit/minijuegos/rendimiento.test.ts`: generar la vista y verificar la solución de la peor combinación de cada tipo (nivel difícil) en < 500 ms de media sobre 20 semillas (CE-003); falla con un mensaje que indica el tipo y el tiempo.

---

## Fase 6: Pulido y transversal

- [X] T034 [P] Revisar todos los textos de `components/minijuegos/*`, `components/SelectorMinijuego.tsx` y de las acciones nuevas: español de España, sin anglicismos («Reiniciar», «Reintentar», «Comprobar»), con la explicación «Cómo se juega» de los cinco tipos en el propio componente (RF-015, CE-007).
- [ ] T035 [P] Revisión móvil y accesibilidad: a 320 px, sin desplazamiento horizontal en los cinco tableros ni en la vista previa del editor; objetivos táctiles ≥ 44 px; estados con texto, no solo color (RF-013, RF-014). Ejecutar `npx vitest run tests/unit/estilos.test.ts` tras terminar cada tipo, no solo al final.
- [X] T036 [P] Actualizar `README.md` con una sección breve «Minijuegos» (qué tipos hay, que se generan con algoritmo propio y que hay que aplicar la migración `0003_minijuego.sql`).
- [X] T037 Ejecutar `npm test`, `npm run lint` y `npm run build`: todo en verde, incluidas las pruebas de la spec 001 y 002 sin modificar (CE-009). _Resultado: 76 pruebas y `npm run build` en verde; `npm run lint` no está configurado en el proyecto (pide crear una configuración de ESLint), así que no se ejecutó._ Comprobar además que `git diff main -- package.json` no añade dependencias y que `grep -rn "fetch(\|https\?://" lib/minijuegos/` no devuelve nada (RF-002, CE-008).
- [ ] T038 Recorrer los 11 escenarios de [quickstart.md](quickstart.md) y anotar el resultado en el propio fichero o en la descripción de la entrega; prestar atención especial al escenario 5 (la contraseña no se filtra en el HTML ni en la pestaña Red) y al 10 (puzzles anteriores sin cambios). Para CE-004, cronometrar a una persona que no conozca el juego resolviendo un minijuego Fácil de cada tipo: debe tardar menos de 3 minutos.

---

## Dependencias y orden de ejecución

- **Fase 1 → Fase 2 → Fases 3 y 4 → Fase 5 → Fase 6.**
- **US1 (Fase 3)** depende de Fundamentos; usa Laberinto como primer tipo completo.
- **US2 (Fase 4)** depende de Fundamentos y de T008 (Laberinto) para probar la tubería; T014–T016 antes de poder cerrar cualquier tipo. Los tipos Rush Hour, Lights Out, Mastermind y Sudoku son independientes entre sí.
- **US3 (Fase 5)** necesita los cinco generadores.
- Dentro de cada tipo: lógica en `lib/` → prueba → componente.
- T029 (seguridad) se escribe cuando existan los cinco generadores, pero conviene lanzarla al terminar cada uno.

## Oportunidades de paralelismo

- Fase 1: T002, T003 y T004 en paralelo (T001 es independiente).
- Fase 2: T007 en paralelo con T005/T006.
- Fase 4, tras T014–T016: los cuatro bloques de tipos pueden hacerlos personas o agentes distintos a la vez (T017–T019, T020–T022, T023–T025, T026–T028), porque cada uno toca solo sus propios ficheros.
- Fase 5: T031, T032 y T033 en paralelo.
- Fase 6: T034, T035 y T036 en paralelo.

### Ejemplo de paralelismo (Fase 4)

```text
Persona A: T017 → T018 → T019   (Rush Hour)
Persona B: T020 → T021 → T022   (Lights Out)
Persona C: T023 → T025 → T024   (Mastermind)
Persona D: T026 → T027 → T028   (Sudoku)
```

## Estrategia de implementación

1. **MVP**: Fases 1, 2 y 3, y T014–T016 de la Fase 4, con solo el Laberinto. Es una funcionalidad completa de extremo a extremo (el master añade, el jugador resuelve y obtiene la contraseña), con la seguridad ya resuelta.
2. **Incremento**: añadir los otros cuatro tipos uno a uno (Fase 4); cada uno se puede entregar por separado porque el selector solo ofrece los tipos de `TIPOS_DISPONIBLES`, que cada tarea de tipo amplía cuando su prueba pasa; así nunca se ofrece algo que falla.
3. **Calidad**: Fase 5 al terminar los cinco tipos; Fase 6 antes de dar por cerrada la funcionalidad.
