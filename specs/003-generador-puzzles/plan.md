# Plan de implementación: Generador automático de puzzles

**Rama**: `003-generador-puzzles` | **Fecha**: 2026-10-14 | **Spec**: [spec.md](spec.md)

**Entrada**: especificación en `/specs/003-generador-puzzles/spec.md`

## Resumen

Se añade a cada puzzle un **minijuego opcional** (Rush Hour, Lights Out, Mastermind, Sudoku o Laberinto) que el master genera con un botón. Al resolverlo, el jugador ve la contraseña del puzzle. Sobre el stack existente (Next.js 14 + TypeScript + Supabase) **no se añade ninguna dependencia**.

Enfoque:

1. **Generadores propios, puros y deterministas** en `lib/minijuegos/`: reciben `(tipo, nivel, semilla)` y devuelven siempre el mismo tablero. Ninguna IA, ningún servicio externo, coste cero.
2. **En la base de datos solo se guarda la «receta»** (`tipo`, `nivel`, `semilla`) en una columna nueva `puzzles.minijuego`. El tablero se vuelve a calcular cuando hace falta, así que es siempre idéntico (RF-006) y no se almacenan tableros.
3. **La contraseña solo sale del servidor cuando el servidor ha comprobado la solución** (RF-008). El navegador del jugador recibe el tablero inicial **sin** solución ni semilla; al terminar envía su resolución (movimientos, casillas o cuadrícula) y el servidor la verifica rehaciendo el tablero desde la semilla.
4. **Mastermind es el caso especial**: el código secreto no puede viajar al navegador, así que cada intento se comprueba en el servidor, que devuelve las pistas.
5. **Un componente de interfaz por tipo** (`components/minijuegos/`) y uno contenedor que gestiona reiniciar, resolver y mostrar la contraseña.

## Decisiones importantes, explicadas sin jerga

> El detalle y las alternativas descartadas están en [research.md](research.md).

1. **Se guarda la semilla, no el tablero.** Una semilla es un número que, pasado por el generador, produce siempre el mismo puzzle. «Generar de nuevo» solo cambia el número. Es lo más simple y evita datos grandes.
2. **El jugador nunca recibe la semilla ni la solución.** Recibe solo el tablero visible. Si la recibiera, podría calcular la solución (o el código de Mastermind) en su navegador y saltarse el reto.
3. **El servidor es quien dice «resuelto».** El jugador envía cómo lo ha resuelto y el servidor lo comprueba; solo entonces devuelve la contraseña. Basta con que el navegador diga «he ganado» para que no sirva.
4. **Una columna nueva en `puzzles`, no un tipo nuevo de elemento.** Solo se admite un minijuego por puzzle, así que una columna nula es lo más simple y no toca la lógica de textos/imágenes. En pantalla se muestra tras el enunciado y antes del campo de contraseña.
5. **La contraseña sigue siendo la del master.** El minijuego se limita a revelarla; la comparación de la spec 001 no cambia.
6. **Sin límite de intentos en el servidor.** Igual que con las contraseñas en la spec 001, no se guarda nada del jugador (RF-012). El límite de intentos de Mastermind es de interfaz.
7. **Dificultad por tablas.** Cada tipo tiene una tabla pequeña fácil/medio/difícil (tamaño, nº de piezas, longitud del código, casillas vacías…) en un único fichero de configuración.
8. **Probado de forma automática.** Pruebas de Vitest generan cientos de tableros por tipo y nivel y comprueban que son resolubles (CE-002), que el Sudoku es único y que la generación es rápida (CE-003).

## Contexto técnico

**Lenguaje/Versión**: TypeScript 5 sobre Node.js 20 LTS (sin cambios)

**Dependencias principales**: las existentes (Next.js 14, React, Tailwind CSS 3, Supabase). **Ninguna nueva.** Pseudoaleatoriedad con un generador propio de unas pocas líneas (mulberry32); semillas con `crypto` de Node.

**Almacenamiento**: Supabase Postgres, una migración `0003_minijuego.sql`: columna `puzzles.minijuego jsonb` nula. Las políticas RLS existentes de `puzzles` ya cubren la columna. Ver [data-model.md](data-model.md).

**Pruebas**: Vitest para los generadores y validadores (lógica pura) + guía manual de [quickstart.md](quickstart.md)

**Plataforma objetivo**: navegadores modernos en móvil (≥ 320 px), tableta y ordenador, con dedo o ratón; teclado como apoyo en el laberinto

**Tipo de proyecto**: aplicación web única (sin cambios)

**Objetivos de rendimiento**: generar y mostrar un minijuego en < 2 s (CE-003); Sudoku difícil y Rush Hour difícil son los más costosos, con presupuesto de 500 ms en servidor

**Restricciones**: la contraseña y la solución nunca llegan al navegador antes de resolver; sin guardar progreso; español de España; sin IA ni servicios externos; no alterar puzzles existentes (RF-016)

**Escala/Alcance**: 5 generadores, 5 componentes de juego, 1 contenedor, 1 columna nueva, 4 acciones de servidor (2 de master y 2 de jugador), 1 prueba por generador

## Comprobación de la constitución

*Puerta: debe pasar antes de la investigación (Fase 0). Se vuelve a comprobar tras el diseño (Fase 1).*

| Principio | Cumple | Cómo |
|---|---|---|
| I. Simplicidad ante todo | ✅ | Sin dependencias; una columna en vez de tabla nueva; semilla en vez de tablero guardado; sin estado de sesión en el servidor. |
| II. Español de España | ✅ | Nombres de tipos, reglas, mensajes e instrucciones en español de España. |
| III. Cero alcance fantasma | ✅ | Solo los cinco tipos, tres niveles, un minijuego por puzzle, reiniciar y regenerar. Sin ranking, sin pistas extra, sin editor manual de tableros, sin botón de «copiar contraseña». |
| IV. Verificable por una persona no técnica | ✅ | [quickstart.md](quickstart.md) describe cada comprobación usando la propia aplicación. |
| V. Bien securizada | ✅ | La contraseña, la semilla y la solución no salen del servidor antes de resolver; la verificación es del servidor; el acceso sigue siendo solo por token del QR. |
| VI. Login solo para el usuario master | ✅ | Añadir/quitar minijuegos requiere sesión de master y propiedad de la aventura (RLS); el jugador juega sin cuenta. |

**Resultado**: sin violaciones. No hace falta «Seguimiento de complejidad».

**Re-comprobación tras el diseño (Fase 1)**: se mantiene. El diseño añade una columna y cuatro acciones, sin dependencias ni rutas nuevas; ver [contracts/](contracts/).

## Estructura del proyecto

### Documentación (esta funcionalidad)

```text
specs/003-generador-puzzles/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── minijuego.md       # forma guardada, vista pública y respuestas por tipo
│   └── acciones.md        # acciones de servidor (master y jugador)
├── checklists/requirements.md
└── tasks.md               # lo crea /speckit-tasks
```

### Código fuente (raíz del repositorio)

```text
lib/minijuegos/
├── tipos.ts          # tipos TS compartidos: Minijuego, Vista*, Respuesta*, Nivel
├── config.ts         # tablas de dificultad por tipo y nivel
├── prng.ts           # mulberry32 + utilidades (entero en rango, barajar con semilla)
├── rushhour.ts       # generar, vistaPublica, verificar (+ solucionador BFS)
├── lightsout.ts
├── mastermind.ts     # generar secreto, pistas(intento)
├── sudoku.ts         # generar con solución única, verificar
├── laberinto.ts
└── index.ts          # generarVista(minijuego), verificarRespuesta(minijuego, respuesta)

components/minijuegos/
├── Minijuego.tsx     # contenedor: reglas, reiniciar, enviar, mostrar contraseña
├── RushHour.tsx
├── LightsOut.tsx
├── Mastermind.tsx
├── Sudoku.tsx
└── Laberinto.tsx
components/SelectorMinijuego.tsx   # «Añadir minijuego» del editor: tipo + nivel + vista previa

app/aventuras/[id]/actions.ts      # + guardarMinijuego, quitarMinijuego; actualizarPuzzle valida contraseña
app/p/[token]/actions.ts           # + resolverMinijuego, probarCodigo
app/p/[token]/page.tsx             # selecciona `minijuego` y pinta <Minijuego/>

supabase/migrations/0003_minijuego.sql
tests/unit/minijuegos/*.test.ts
```

**Decisión de estructura**: se mantiene el proyecto único. Los generadores van en `lib/` como funciones puras (fáciles de probar) y solo se importan desde el servidor (`import "server-only"`); los componentes de cliente usan únicamente `tipos.ts`, `config.ts` y `reglas.ts` (reglas puras sobre la vista pública, compartidas con los verificadores). La vista pública se calcula en el servidor y solo el resultado viaja, así que ni la semilla ni la solución llegan al paquete del navegador.

## Seguimiento de complejidad

Sin violaciones de la constitución que justificar.
