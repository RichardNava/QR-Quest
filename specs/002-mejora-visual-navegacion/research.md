# Investigación: Mejora visual y navegación común

Cada decisión sigue el formato **Decisión / Motivo / Alternativas descartadas**. No quedan puntos «NEEDS CLARIFICATION».

## 1. Dónde se define la paleta

- **Decisión**: variables CSS (`--color-…`) en `:root` de `app/globals.css` como **única fuente**; `tailwind.config.ts` define colores semánticos (`papel`, `superficie`, `tinta`, `tinta-suave`, `marca`, `marca-oscura`, `acento`, `acento-suave`, `borde`, `exito`, `exito-suave`, `peligro`, `peligro-suave`) que apuntan a esas variables.
- **Motivo**: cumple FR-009 y SC-003 (cambiar un valor cambia toda la aplicación) con herramientas que ya están en el proyecto. Los nombres semánticos evitan que alguien escriba `indigo-600` por costumbre.
- **Alternativas**: (a) solo `tailwind.config.ts` con hex: también es «un único lugar», pero impide usar la paleta en CSS puro (impresión, `globals.css`); (b) tokens en TypeScript: más código sin beneficio; (c) librería de componentes/temas: dependencia nueva, contraria al principio I.

## 2. Valores de la paleta y contraste

Paleta de aventura cálida (tierra, terracota, ámbar), 13 tokens:

| Token | Valor | Uso |
|---|---|---|
| `papel` | `#FBF3E4` | fondo de página |
| `superficie` | `#FFFDF8` | tarjetas, campos |
| `tinta` | `#3B2A1E` | texto principal |
| `tinta-suave` | `#6B5442` | texto secundario |
| `marca` | `#B4491F` | botón principal, enlaces |
| `marca-oscura` | `#8F3715` | hover, barra de navegación |
| `acento` | `#E2A33B` | detalles, sección activa |
| `acento-suave` | `#F6DFA8` | fondos de aviso |
| `borde` | `#E3D3B6` | bordes y separadores |
| `exito` / `exito-suave` | `#3F6B2F` / `#E4EFD8` | correcto, resuelto |
| `peligro` / `peligro-suave` | `#A32A24` / `#F8E1DC` | error, eliminar |

Contrastes calculados (mínimo exigido 4,5:1 para texto normal, FR-012):

| Texto sobre fondo | Ratio |
|---|---|
| tinta / papel | 12,4 |
| tinta / superficie | 13,5 |
| tinta-suave / papel | 6,4 |
| tinta-suave / superficie | 7,0 |
| superficie / marca (botón) | 5,3 |
| superficie / marca-oscura | 7,6 |
| marca / papel (enlace) | 4,9 |
| marca / superficie (enlace) | 5,3 |
| tinta / acento | 6,2 |
| tinta / acento-suave | 10,4 |
| exito / exito-suave | 5,3 |
| peligro / peligro-suave | 5,8 |

- **Motivo**: todos superan el mínimo, también en móvil al aire libre.
- **Alternativas**: usar la paleta ámbar por defecto de Tailwind: contraste insuficiente del texto ámbar sobre crema.

## 3. Tipografía (revisada tras la primera revisión visual)

- **Decisión**: dos familias, ambas con soporte completo del español: **Barlow Condensed** (títulos, mayúsculas, aspecto de expedición) e **Inter** (texto). Se cargan con `next/font/google` (subconjunto latino, `display: swap`). Escala: título de página 28–32 px/extrabold, título de sección 20 px/bold, texto 16 px, apoyo 14 px.
- **Motivo**: FR-008 pide una única familia; `next/font` descarga la fuente al compilar y la sirve desde la propia web, sin peticiones a terceros desde el móvil del jugador y sin dependencia nueva.
- **Alternativas**: dos familias (serif para títulos): contradice FR-008; fuente del sistema: más simple pero no aporta identidad; enlace directo a Google Fonts: petición externa en cada visita.

## 4. Dónde se monta la navegación

- **Decisión**: componente `Navegacion` en `app/layout.tsx`. El layout (componente de servidor) averigua si hay sesión con el cliente de Supabase que ya usa la aplicación y se lo pasa a `Navegacion` (componente de cliente) que decide qué mostrar según la ruta (`usePathname`).
- **Motivo**: es el único punto que envuelve **todas** las páginas, incluidas las de error (FR-001). Evita tocar cada página.
- **Coste asumido**: el layout raíz consulta la sesión en cada petición, también en `/p/…`. Es una lectura de cookie con una comprobación ligera; el middleware sigue sin cubrir `/p/` y no se modifica. El resultado no se usa en `/p/` (solo se muestra la marca), de modo que no se expone nada.
- **Alternativas**: (a) un layout por grupo de rutas: obligaría a mover ficheros y cambiar la estructura (prohibido por FR-018); (b) cabecera en cada página: duplicación y riesgo de olvidos; (c) modificar el middleware para pasar la ruta: toca lógica, fuera de alcance.

## 5. Contenido de la navegación

Detalle en [contracts/navegacion.md](contracts/navegacion.md). Resumen:

- Jugador (`/p/…`): solo la marca (decisión de clarificación 2026-10-13).
- Visitante: marca + «Entrar» + «Crear cuenta».
- Master: marca + «Mis aventuras» + «Cerrar sesión». En `/aventuras/<id>` y `/aventuras/<id>/rejilla` aparece una segunda fila «Editar · Rejilla».
- **Cerrar sesión** reutiliza el componente existente (`CerrarSesion`) sin cambiar su comportamiento.
- **Sin menú desplegable**: cabe en 320 px con 2–3 opciones y tamaño de pulsación ≥ 44 px.
- Se marca la sección activa con `aria-current="page"` y estilo visible (subrayado de acento + texto en negrita, no solo color).
- Oculta al imprimir con la clase `no-imprimir` ya existente.
- **Páginas de recuperación/restablecimiento**: usan la navegación de visitante (supuesto de la spec).
- **Sesión caducada**: sin cambios; el middleware ya redirige a `/entrar`, que muestra la navegación de visitante.

## 6. Espaciado y jerarquía

- **Decisión**: se mantiene la escala por defecto de Tailwind (múltiplos de 4 px) y se fijan reglas: separación entre bloques de página `space-y-6`, dentro de tarjeta `space-y-4`, relleno de tarjeta `p-5`, campos y botones con altura mínima de 44 px. Se centralizan en `components/estilos.ts` como presets (`titulo1`, `titulo2`, `tarjeta`, `campo`, `boton`, `botonSecundario`, `botonPeligro`, `enlace`, `aviso*`, `insignia*`).
- **Motivo**: FR-010/FR-011 con cero configuración nueva; ya existe `estilos.ts` y los componentes lo importan.
- **Nota sobre tablas**: la aplicación no tiene tablas; las «tablas o listas» de la spec corresponden a la lista de aventuras y a la rejilla de QR, que reciben el mismo tratamiento de tarjeta y jerarquía.
- **Alternativas**: escala de espaciado propia en la configuración: reinventa lo que Tailwind ya da.

## 7. Estados visuales

Detalle en [contracts/estados.md](contracts/estados.md). Resumen:

- Componente `Insignia` con tres variantes (`exito`, `peligro`, `aviso`) más neutra; siempre lleva **icono y texto** (FR-015).
- **Puzzle** (master): «Incompleto» cuando falta contraseña o la recompensa no tiene contenido (misma condición que ya usa la rejilla para avisar). **Puzzle** (jugador): formulario sin resolver, «Correcto»/«Fin de la aventura» al acertar, aviso de error al fallar.
- **Imagen**: etiqueta «Normal», «Difuminada» o «Rompecabezas» en el editor; en el juego, «Difuminada · pulsa para revelar» y «Rompecabezas · por resolver / ✓ Recompuesto».
- **Alternativas**: iconos de una librería: dependencia nueva; se usan caracteres Unicode/SVG en línea muy simples.

## 8. Impresión

- **Decisión**: se conservan `no-imprimir`, la cuadrícula de 3 columnas y `break-inside: avoid` de la rejilla. Las tarjetas de QR conservan fondo blanco puro y borde fino de `borde`; no se aplican fondos de color a la zona imprimible.
- **Motivo**: FR-019 y SC-008 (mismo paginado, QR escaneables). Un QR necesita fondo claro y contraste alto: se mantiene blanco sobre negro.

## 9. Pruebas

- **Decisión**: una prueba de Vitest recorre `app/` y `components/` y falla si encuentra clases de color de la paleta por defecto de Tailwind (`indigo-`, `slate-`, `red-`…), valores hexadecimales o `rgb(`, fuera de `app/globals.css`. Las pruebas de la spec 001 siguen sin tocarse (SC-007). El resto se comprueba con [quickstart.md](quickstart.md).
- **Alternativas**: pruebas visuales automáticas con capturas: infraestructura nueva no pedida, contraria a los principios I y III.
