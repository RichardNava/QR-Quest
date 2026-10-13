# Plan de implementación: Mejora visual y navegación común

**Rama**: `002-mejora-visual-navegacion` | **Fecha**: 2026-10-13 | **Spec**: [spec.md](spec.md)

**Entrada**: especificación en `/specs/002-mejora-visual-navegacion/spec.md`

## Resumen

Esta funcionalidad solo toca la **capa de presentación** de la aplicación de la [spec 001](../001-qr-quest-v0/spec.md). El stack, las convenciones y la estructura de carpetas se quedan como están (Next.js 14 App Router + Tailwind CSS + TypeScript). No se añade ninguna dependencia nueva, ninguna ruta, ninguna tabla ni ninguna regla de negocio.

El enfoque es el más corto posible:

1. **Una paleta en un único sitio**: variables CSS en `app/globals.css`, que Tailwind expone con nombres semánticos (`marca`, `papel`, `tinta`, `exito`…). Cambiar un valor ahí cambia toda la aplicación.
2. **Una navegación en un único sitio**: un componente `Navegacion` que se monta en el layout raíz (`app/layout.tsx`), de modo que aparece en todas las páginas, incluidas las de error. Sustituye a la cabecera que hoy solo existe en `app/aventuras/layout.tsx`.
3. **Un único fichero de estilos reutilizables** (`components/estilos.ts`, que ya existe) que se amplía con títulos, insignias de estado y paneles. Las páginas y componentes dejan de llevar colores sueltos y usan estos estilos.
4. **Estados visuales con insignia** (texto + icono + color) para puzzles e imágenes, sin depender solo del color.

## Decisiones importantes, explicadas sin jerga

> El detalle y las alternativas descartadas están en [research.md](research.md).

1. **La navegación vive en el layout raíz.** Así aparece en todas las páginas sin tocar cada una (portada, registro, entrada, recuperación, aventuras, rejilla, puzzle y páginas de «no existe»). Es un componente de pantalla que solo sabe dos cosas: si hay sesión y en qué dirección está el usuario.
2. **El jugador solo ve la marca.** En cualquier dirección que empiece por `/p/` la barra muestra únicamente «QR Quest» enlazada a la portada (decisión de la sesión de clarificación). Esto también vale para la página «Este puzzle ya no existe».
3. **Dentro de una aventura aparece una segunda fila** con «Editar» y «Rejilla» de esa aventura. El identificador sale de la propia dirección, así que no hace falta pedir datos nuevos.
4. **La paleta cálida de aventura**: papel crema de fondo, tinta marrón oscuro para el texto, terracota como color de marca, ámbar como acento, verde oliva para «correcto» y rojo ladrillo para «error». Todos los pares de texto/fondo se han calculado con contraste ≥ 4,5:1 (ver [research.md](research.md)).
5. **Una sola fuente, cargada con la herramienta de fuentes de Next.js.** Se descarga al compilar y se sirve desde la propia web: sin peticiones a terceros cuando alguien abre la página, ni parpadeo.
6. **Sin menú «hamburguesa».** Con 2–3 opciones, la barra cabe en 320 px. Es lo más simple y evita código de interacción nuevo.
7. **Una prueba automática de «solo colores de la paleta»** (Vitest, la herramienta que ya usamos): falla si algún fichero de la aplicación usa un color suelto en lugar de uno de la paleta. Así el criterio SC-003 se comprueba solo.
8. **Los estados de puzzle/imagen se derivan de lo que ya se sabe en pantalla** (contraseña vacía, recompensa sin contenido, modo de la imagen, acierto/fallo). No se añade ninguna regla: solo se pinta con claridad lo que ya existía, con las mismas condiciones que la rejilla ya usa para avisar de problemas.

## Contexto técnico

**Lenguaje/Versión**: TypeScript 5 sobre Node.js 20 LTS (sin cambios)

**Dependencias principales**: las existentes (Next.js 14, React, Tailwind CSS 3, Supabase, `qrcode.react`, `@dnd-kit/core`). **Ninguna nueva.** La fuente se carga con `next/font`, que ya forma parte de Next.js.

**Almacenamiento**: N/A (sin cambios)

**Pruebas**: Vitest (se añade una prueba de coherencia de estilos; las pruebas de la spec 001 no se tocan) + guía manual de [quickstart.md](quickstart.md)

**Plataforma objetivo**: navegadores modernos en móvil (≥ 320 px), tableta y ordenador; impresión de la rejilla sin cambios

**Tipo de proyecto**: aplicación web única (sin cambios)

**Objetivos de rendimiento**: la mejora no debe empeorar el tiempo de carga del puzzle en 4G (CE-003 de la spec 001): una sola familia tipográfica con subconjunto latino, sin imágenes decorativas pesadas ni librerías de iconos

**Restricciones**: solo visual (FR-018); español de España; mobile-first; navegación oculta al imprimir; sin modo oscuro; sin cambios en rutas, datos ni comportamiento

**Escala/Alcance**: 9 páginas (4 de acceso, portada, lista de aventuras, editor, rejilla, puzzle del jugador) más 2 páginas de «no existe» y 14 componentes existentes

## Comprobación de la constitución

*Puerta: debe pasar antes de la investigación (Fase 0). Se vuelve a comprobar tras el diseño (Fase 1).*

| Principio | Cumple | Cómo |
|---|---|---|
| I. Simplicidad ante todo | ✅ | Sin dependencias nuevas, sin menú desplegable, sin sistema de temas: variables CSS + Tailwind, que ya están en el proyecto. |
| II. Español de España | ✅ | Los textos nuevos (insignias, etiquetas de navegación) están en español de España; los existentes no cambian de significado. |
| III. Cero alcance fantasma | ✅ | Solo se implementa lo escrito en la spec: navegación, paleta, tipografía, espaciado, jerarquía y estados. Sin modo oscuro, sin secciones nuevas, sin animaciones esenciales. |
| IV. Verificable por una persona no técnica | ✅ | [quickstart.md](quickstart.md) describe comprobaciones visuales con la aplicación delante, página por página. |
| V. Bien securizada | ✅ | La página del jugador (`/p/…`) solo muestra la marca; no se añade ningún dato nuevo ni se consulta nada de la aventura. Las rutas y su protección no cambian. |
| VI. Login solo para el usuario master | ✅ | La navegación de gestión solo aparece con sesión; el jugador no ve ningún acceso de cuenta. |

**Resultado**: sin violaciones. No hace falta rellenar «Seguimiento de complejidad».

**Re-comprobación tras el diseño (Fase 1)**: se mantiene. El diseño no introduce rutas, datos ni dependencias; los contratos de [contracts/](contracts/) describen solo apariencia y comportamiento visible.

## Estructura del proyecto

### Documentación (esta funcionalidad)

```text
specs/002-mejora-visual-navegacion/
├── plan.md              # Este fichero
├── research.md          # Fase 0: decisiones y alternativas
├── data-model.md        # Fase 1: sin datos nuevos; tokens visuales
├── quickstart.md        # Fase 1: guía de comprobación manual
├── contracts/
│   ├── navegacion.md    # Qué muestra la barra en cada página y estado
│   ├── estilo.md        # Paleta, tipografía, espaciado y jerarquía
│   └── estados.md       # Aspecto de cada estado de puzzle e imagen
└── tasks.md             # Fase 2 (/speckit-tasks; no lo crea este comando)
```

### Código fuente (raíz del repositorio)

La estructura existente **no cambia**. Solo se tocan o añaden estos ficheros dentro de las carpetas ya existentes:

```text
app/
├── globals.css              # MODIFICA: variables de la paleta, base tipográfica, reglas de impresión
├── layout.tsx               # MODIFICA: fuente, fondo y monta <Navegacion/> para todas las páginas
├── page.tsx                 # MODIFICA: solo clases visuales (portada)
├── not-found.tsx            # MODIFICA: solo clases visuales
├── (auth)/*/page.tsx        # MODIFICA: solo clases visuales (4 páginas)
├── aventuras/
│   ├── layout.tsx           # MODIFICA: se elimina la cabecera propia (la sustituye la común)
│   ├── page.tsx             # MODIFICA: solo clases visuales
│   └── [id]/page.tsx, [id]/rejilla/page.tsx   # MODIFICA: solo clases visuales
└── p/[token]/page.tsx, not-found.tsx          # MODIFICA: solo clases visuales

components/
├── Navegacion.tsx           # NUEVO: barra común (usa la ruta actual y si hay sesión)
├── Insignia.tsx             # NUEVO: etiqueta de estado (icono + texto + color)
├── estilos.ts               # MODIFICA: presets reutilizables basados en la paleta
└── (resto de componentes)   # MODIFICA: solo clases visuales y, donde toca, una insignia

tailwind.config.ts           # MODIFICA: colores semánticos que leen las variables CSS
tests/unit/estilos.test.ts   # NUEVO: comprueba que no hay colores fuera de la paleta
```

**Decisión de estructura**: se conserva la aplicación única de la spec 001. `Navegacion` y `Insignia` son los dos únicos componentes nuevos y viven en `components/`, junto al resto. No se crean carpetas ni rutas nuevas, y no se tocan `lib/`, `supabase/`, `middleware.ts` ni las acciones de servidor (`actions.ts`).

## Seguimiento de complejidad

Sin violaciones de la constitución: no hay nada que justificar.
