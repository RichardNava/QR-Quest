---

description: "Lista de tareas: Mejora visual y navegación común"
---

# Tareas: Mejora visual y navegación común

**Entrada**: documentos de diseño en `/specs/002-mejora-visual-navegacion/`

**Requisitos previos**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

**Pruebas**: la spec no pide pruebas nuevas de comportamiento. Solo se añade la prueba de coherencia de estilos que fija el plan (SC-003); las de la spec 001 no se tocan (SC-007).

**Alcance**: SOLO capa de presentación (FR-018). **Prohibido tocar**: `lib/`, `supabase/`, `middleware.ts`, `app/**/actions.ts`, `tests/unit/barajar.test.ts`, `tests/unit/normalizar.test.ts`. No cambiar ningún texto existente de significado, ninguna ruta, ninguna condición ni ningún nombre de propiedad. Sin dependencias nuevas.

**Formato**: `[ID] [P?] [Historia] Descripción con ruta`

- **[P]**: se puede hacer en paralelo (ficheros distintos, sin dependencias pendientes)
- **[US1/US2/US3]**: historia de la spec a la que pertenece la tarea

**Referencia de paleta** (tokens de Tailwind que se crean en T002; valores en [research.md](research.md)): `papel`, `superficie`, `tinta`, `tinta-suave`, `marca`, `marca-oscura`, `acento`, `acento-suave`, `borde`, `exito`, `exito-suave`, `peligro`, `peligro-suave`. **Equivalencias para migrar**: `indigo-*` → `marca`/`marca-oscura`; `slate-800` → `tinta`; `slate-600/700` → `tinta-suave`; `slate-50/200/300` → `superficie`/`borde`; `amber-50` → `papel`; `amber-200` → `borde`; `red-*` → `peligro`/`peligro-suave`; `green-*` → `exito`/`exito-suave`; `bg-white` → `superficie` (salvo tarjetas de QR de la rejilla, que se quedan en blanco puro).

---

## Fase 1: Preparación (base compartida)

**Propósito**: paleta, fuente y presets, el único lugar donde se define el aspecto.

- [X] T001 Definir la paleta en `app/globals.css`: en `:root`, variables `--color-papel: #FBF3E4`, `--color-superficie: #FFFDF8`, `--color-tinta: #3B2A1E`, `--color-tinta-suave: #6B5442`, `--color-marca: #B4491F`, `--color-marca-oscura: #8F3715`, `--color-acento: #E2A33B`, `--color-acento-suave: #F6DFA8`, `--color-borde: #E3D3B6`, `--color-exito: #3F6B2F`, `--color-exito-suave: #E4EFD8`, `--color-peligro: #A32A24`, `--color-peligro-suave: #F8E1DC`. Mantener las directivas `@tailwind` y la regla `@media print` existentes, cambiando el fondo de impresión a `#fff` (ya lo es). Este es el ÚNICO fichero con valores de color.
- [X] T002 Exponer los tokens en `tailwind.config.ts`: en `theme.extend.colors`, un color por token con el mismo nombre (sin el prefijo `--color-`) que apunte a su variable, p. ej. `marca: "var(--color-marca)"`. No añadir plugins ni otros ajustes. Depende de T001.
- [X] T003 [P] Cargar la fuente única en `app/layout.tsx` con `next/font/google`: `Nunito` (subconjunto `latin`, `display: "swap"`, variable CSS `--fuente`), aplicar su clase a `<body>`; y definir `fontFamily.sans` en `tailwind.config.ts` como `["var(--fuente)", "system-ui", "sans-serif"]`. Mantener `lang="es-ES"` y los `metadata` existentes. (Si T002 aún no está, coordinar el edit de `tailwind.config.ts` tras T002.)

---

## Fase 2: Fundamentos (bloquea todas las historias)

**Propósito**: presets y componente de insignia que usan todas las historias.

**⚠️ CRÍTICO**: ninguna historia puede empezar hasta terminar esta fase.

- [X] T004 Reescribir `components/estilos.ts` manteniendo los **mismos nombres exportados** (`boton`, `botonSecundario`, `botonPeligro`, `campo`, `tarjeta`, `enlace`, `error`) pero con tokens de la paleta, y añadir: `titulo1` (28–32 px, extrabold, `text-tinta`), `titulo2` (20 px, bold), `etiqueta` (16 px, semibold), `apoyo` (14 px, `text-tinta-suave`), `aviso` (panel `bg-peligro-suave text-peligro` con borde) —`error` debe seguir exportándose y apuntar al mismo estilo—, `avisoInfo` (`bg-acento-suave text-tinta`), `bloque` (`space-y-6`, para el `<main>` de las páginas) y `enlaceNav`. Reglas: botones y campos con `min-h-[44px]`; botón principal `bg-marca text-superficie hover:bg-marca-oscura`; secundario con borde `borde`; peligro `text-peligro` con borde `peligro`; foco visible con anillo `acento` (`focus-visible:ring-2`); tarjeta `rounded-xl border border-borde bg-superficie p-5 shadow-sm`. Contrato: [contracts/estilo.md](contracts/estilo.md).
- [X] T005 [P] Crear `components/Insignia.tsx`: componente sin estado que recibe `variante: "exito" | "peligro" | "aviso" | "neutra"`, `icono` opcional (texto) y `children`; renderiza `<span>` redondeado con icono (aria-hidden) + texto, colores `exito/exito-suave`, `peligro/peligro-suave`, `acento-suave/tinta`, `superficie/tinta-suave` con borde `borde`. Sin dependencias de librerías de iconos (usar caracteres «✓», «✕», «⚠»). Contrato: [contracts/estados.md](contracts/estados.md).

**Punto de control**: paleta, fuente, presets e insignia listos.

---

## Fase 3: Historia 1 - Navegación común en todas las páginas (Prioridad: P1) 🎯 MVP

**Objetivo**: todas las páginas muestran una barra común, adaptada al usuario y a la sección.

**Prueba independiente**: sección A de [quickstart.md](quickstart.md) (A1–A9).

- [X] T006 [US1] Crear `components/Navegacion.tsx` (componente de cliente, `"use client"`) con props `{ haySesion: boolean }` y `usePathname()`. Reglas exactas de [contracts/navegacion.md](contracts/navegacion.md): si la ruta empieza por `/p/` → solo la marca «QR Quest» enlazada a `/`; sin sesión → marca + «Entrar» (`/entrar`) + «Crear cuenta» (`/registro`); con sesión → marca + «Mis aventuras» (`/aventuras`) + `<CerrarSesion />` (componente existente, sin modificar su lógica). Si la ruta casa con `/aventuras/<id>` o `/aventuras/<id>/rejilla` (extraer `<id>` de la ruta), añadir segunda fila `<nav aria-label="De la aventura">` con «Editar» (`/aventuras/<id>`) y «Rejilla» (`/aventuras/<id>/rejilla`). Opción activa con `aria-current="page"`, negrita y subrayado `acento` (no solo color). Barra con `bg-marca-oscura text-superficie`, áreas de pulsación ≥ 44 px, sin scroll horizontal a 320 px, `<nav aria-label="Principal">`, clase `no-imprimir` en todo el contenedor. Sin menú desplegable. Depende de T004.
- [X] T007 [US1] Montar la barra en `app/layout.tsx`: convertir `RootLayout` en `async`, obtener la sesión con `crearClienteServidor()` de `@/lib/supabase/servidor` (`const { data } = await supabase.auth.getUser()`), y renderizar `<Navegacion haySesion={!!data.user} />` antes del contenedor `{children}` dentro de `<body>`. No usar el resultado para nada más. Mantener `bg-papel text-tinta` en `<body>` y el contenedor `mx-auto w-full max-w-3xl px-4 py-6`. Depende de T003, T006.
- [X] T008 [US1] Eliminar la cabecera propia de `app/aventuras/layout.tsx` (la sustituye la común): dejar el layout devolviendo solo `{children}` y quitar los imports que dejen de usarse (`Link`, `CerrarSesion`). No cambiar nada más. Depende de T007.
- [X] T009 [P] [US1] En `app/aventuras/[id]/rejilla/page.tsx` y `components/RejillaQR.tsx`, comprobar que la barra común no aparece al imprimir (la clase `no-imprimir` de T006 la oculta) y que los elementos con `no-imprimir` existentes (título y botón «Imprimir») siguen ocultándose. Solo ajustar clases si algo falla; no tocar paginado, tamaño de QR ni estructura de la rejilla (FR-019).

**Punto de control**: cualquier página tiene barra; el jugador solo ve la marca; se navega sin botón atrás.

---

## Fase 4: Historia 2 - Apariencia profesional y coherente (Prioridad: P1)

**Objetivo**: mismo aspecto en todas las páginas, solo con tokens de la paleta, tipografía única y espaciado uniforme.

**Prueba independiente**: sección B de [quickstart.md](quickstart.md) (B1–B5) y `npm test`.

> Cada tarea cambia SOLO clases de Tailwind y presets importados; ninguna condición, handler, texto ni prop. Sustituir colores con la tabla de equivalencias de la cabecera. Usar `titulo1` para el único `<h1>` de cada página, `titulo2` para secciones/tarjetas, `apoyo` para texto secundario y `bloque` para el `<main>`.

- [X] T010 [P] [US2] Portada `app/page.tsx` y página «no encontrada» `app/not-found.tsx`: migrar a tokens y presets (título con `titulo1`, texto con `text-tinta`, botones con `boton`/`botonSecundario`); sin cambiar textos ni enlaces.
- [X] T011 [P] [US2] Páginas de acceso `app/(auth)/entrar/page.tsx`, `app/(auth)/registro/page.tsx`, `app/(auth)/recuperar/page.tsx` y `app/(auth)/restablecer/page.tsx`: `<h1>` con `titulo1`, etiquetas con `etiqueta`, enlaces con `enlace`, mensajes con `aviso`/`avisoInfo` (o `error`); tarjeta centrada `max-w-md`; sin cambiar la lógica de formularios ni los textos.
- [X] T012 [P] [US2] Lista de aventuras `app/aventuras/page.tsx` y `components/ListaAventuras.tsx`: título con `titulo1`, «Nueva aventura» con `titulo2`, nombre de aventura como enlace de marca, resumen con `apoyo`, tarjetas con `tarjeta`, `space-y-6`/`space-y-4` según el contrato de espaciado; nombres largos con `break-words` para que no rompan la tarjeta.
- [X] T013 [P] [US2] Editor de aventura `app/aventuras/[id]/page.tsx`, `components/NombreAventura.tsx` y `components/BotonAnadirPuzzle.tsx`: migrar colores, `apoyo` para el contador «N de M imágenes», campo de nombre con `campo`, `break-words` en nombres largos.
- [X] T014 [P] [US2] Editor de puzzle y elementos `components/EditorPuzzle.tsx`, `components/EditorElemento.tsx` y `components/SubidaImagen.tsx`: `tarjeta` para cada puzzle con `titulo2`, secciones con `etiqueta`, elementos con fondo `papel` y borde `borde` (sustituye `bg-slate-50`/`border-slate-200`), botones con presets, errores con `error`/`aviso`. Solo clases.
- [X] T015 [P] [US2] Rejilla `app/aventuras/[id]/rejilla/page.tsx` y `components/RejillaQR.tsx`: título con `titulo1`, panel de problemas con `aviso`, tarjetas de QR con `border-borde bg-white` (blanco puro, necesario para el escaneo) y `[break-inside:avoid]` conservado; no cambiar `grid-cols`, tamaño máximo del QR ni `print:grid-cols-3`. Excepción permitida de `bg-white` documentada en la prueba de T017.
- [X] T016 [P] [US2] Página del jugador y su «no existe»: `app/p/[token]/page.tsx`, `app/p/[token]/not-found.tsx`, `components/FormularioContrasena.tsx` (solo clases del formulario; el estado se trata en T020) y `components/ContenidoPuzzle.tsx` (texto con `text-tinta`, imágenes con `rounded-lg border border-borde`). Título del puzzle con `titulo1`.
- [X] T017 [US2] Crear `tests/unit/estilos.test.ts` (Vitest, mismo estilo que `tests/unit/normalizar.test.ts`): recorrer con `fs` los ficheros `.ts`/`.tsx` de `app/` y `components/` (excluir `app/globals.css`) y fallar si alguno contiene: clases de color de la paleta por defecto de Tailwind (`/\b(bg|text|border|ring|from|to|divide|outline|fill|stroke)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/`), valores `#hex` o `rgb(`/`hsl(`; permitir únicamente `bg-white` en `components/RejillaQR.tsx` y `text-white`/`bg-black` si se usan en ese mismo fichero. El mensaje de error debe listar fichero y coincidencia. Ejecutar al final: debe pasar solo cuando T010–T016 estén hechas. Depende de T010–T016.

**Punto de control**: `npm test` en verde; toda la app con la misma apariencia y paleta.

---

## Fase 5: Historia 3 - Estados visuales distinguibles (Prioridad: P2)

**Objetivo**: estados de puzzle e imagen identificables por icono + texto + color.

**Prueba independiente**: sección C de [quickstart.md](quickstart.md) (C1–C7).

- [X] T018 [US3] En `components/EditorPuzzle.tsx` (tras T014): mostrar junto al título «Puzzle N» una `Insignia` «Completo» (`exito`, ✓) o «Incompleto» (`aviso`, ⚠). «Incompleto» cuando `contrasena.trim()` esté vacía o cuando la recompensa no tenga ningún elemento con imagen ni texto no vacío (misma expresión que ya calcula `sinContenido` en `seccion()`, reutilizarla; no crear reglas nuevas). Con «Incompleto», añadir borde `acento` a la tarjeta. Sin cambiar la lógica de guardado.
- [X] T019 [P] [US3] En `components/EditorElemento.tsx` (tras T014): para elementos de tipo imagen, mostrar una `Insignia` con el modo actual: «Normal» (`neutra`), «Difuminada» (`aviso`), «Rompecabezas» (`aviso`), junto a la vista previa. El `<select>` y su lógica no cambian.
- [X] T020 [US3] En `components/FormularioContrasena.tsx` (tras T016): el aviso de contraseña incorrecta usa `aviso` con icono ✕ y el mismo mensaje; al acertar, la cabecera usa `text-exito` con ✓ y el texto existente («¡Correcto!» / «¡Fin de la aventura!»), y la recompensa va en un panel `bg-exito-suave` con borde `exito`. No cambiar `comprobarContrasena` ni el flujo.
- [X] T021 [P] [US3] En `components/ImagenDifuminada.tsx`: mientras no está revelada, envolver la imagen con borde `acento`, mostrar `Insignia` «Difuminada · pulsa para revelar» (`aviso`) y mantener el botón «Revelar imagen»; al revelarse, quitar el borde y la insignia. La lógica de `revelada` no cambia.
- [X] T022 [P] [US3] En `components/Rompecabezas.tsx`: cuadrícula sin resolver con borde `acento` y `Insignia` «Rompecabezas · por resolver» (`aviso`) sobre el texto de ayuda existente; hueco de destino al arrastrar con `ring-marca` (sustituye `ring-indigo-500`); al estar resuelto, mostrar `Insignia` «Recompuesto» (`exito`, ✓) junto a la imagen completa. No tocar la lógica de barajado, sensores ni `alAcabar`.

**Punto de control**: cada estado tiene aspecto propio y funciona en escala de grises.

---

## Fase 6: Pulido y comprobación final

- [X] T023 Ejecutar `npm test`, `npm run lint` y `npm run build`: todo debe pasar sin errores (incluidas las pruebas de la spec 001 sin modificar).
- [X] T024 Comprobar que no se ha tocado lógica: `git diff --stat` no debe listar `lib/`, `supabase/`, `middleware.ts`, `app/**/actions.ts` ni `tests/unit/barajar.test.ts` / `tests/unit/normalizar.test.ts`; revisar que los cambios en `.tsx` son solo clases, imports de estilos, `Navegacion` e `Insignia`.
- [X] T025 Revisar que todo texto visible nuevo está en español de España y que los textos existentes no han cambiado de significado (FR-017): navegación, insignias y avisos.
- [ ] T026 Ejecutar la guía completa de [quickstart.md](quickstart.md) (secciones A, B, C y D) a 320 px, 768 px y 1280 px, incluida la vista previa de impresión de la rejilla; anotar cualquier incidencia y corregirla antes de dar la funcionalidad por terminada.

---

## Dependencias y orden de ejecución

### Dependencias entre fases

- **Preparación (Fase 1)**: T001 → T002; T003 en paralelo con T001 (su parte de `tailwind.config.ts` va tras T002).
- **Fundamentos (Fase 2)**: depende de la Fase 1; T004 y T005 pueden ir en paralelo. **Bloquea** todas las historias.
- **Historia 1 (Fase 3)**: depende de la Fase 2. T006 → T007 → T008; T009 en paralelo.
- **Historia 2 (Fase 4)**: depende de la Fase 2; **no depende de la Historia 1** (puede hacerse en paralelo, salvo que `app/layout.tsx` lo toquen T003/T007, que no coinciden con las tareas de esta fase). T010–T016 en paralelo; T017 al final.
- **Historia 3 (Fase 5)**: depende de la Fase 2 y de los ficheros migrados en la Historia 2 (T014 para T018/T019, T016 para T020). T021 y T022 pueden empezar ya tras la Fase 2.
- **Pulido (Fase 6)**: tras todas las historias deseadas.

### Dependencias entre historias

- **US1 (P1)**: independiente tras la Fase 2.
- **US2 (P1)**: independiente tras la Fase 2.
- **US3 (P2)**: comparte ficheros con US2 (`EditorPuzzle`, `EditorElemento`, `FormularioContrasena`), por lo que se hace después de ellos para evitar conflictos.

### Oportunidades de paralelismo

- Fase 2: T004 y T005.
- Fase 3: T009 junto a T006–T008.
- Fase 4: T010, T011, T012, T013, T014, T015, T016 (ficheros distintos).
- Fase 5: T019, T021 y T022 (ficheros distintos) tras sus dependencias.

---

## Ejemplo de paralelismo: Historia 2

```text
Lanzar a la vez (ficheros distintos):
- T010 Portada y «no encontrada»
- T011 Páginas de acceso (4)
- T012 Lista de aventuras
- T013 Editor de aventura
- T014 Editor de puzzle y elementos
- T015 Rejilla
- T016 Página del jugador
Después: T017 prueba de coherencia de estilos
```

---

## Estrategia de implementación

### MVP primero (Historia 1)

1. Fase 1 (T001–T003) y Fase 2 (T004–T005).
2. Fase 3 (T006–T009): navegación común.
3. **Parar y validar** con la sección A de [quickstart.md](quickstart.md).

### Entrega incremental

1. Preparación + Fundamentos → base lista.
2. + Historia 1 → navegación en todas las páginas (MVP).
3. + Historia 2 → aspecto profesional y coherente; `npm test` comprueba la paleta.
4. + Historia 3 → estados visuales con insignias.
5. Pulido y comprobación completa (T023–T026).

---

## Notas

- Las tareas [P] tocan ficheros distintos y no dependen de tareas incompletas.
- Cada historia se puede probar por separado con su sección del quickstart.
- Confirmar con `git diff` que ninguna tarea modifica lógica, rutas ni datos (FR-018).
- Hacer commit tras cada tarea o grupo lógico; detenerse en cada punto de control para validar.
