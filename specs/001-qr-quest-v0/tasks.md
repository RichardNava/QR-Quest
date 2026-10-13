---

description: "Lista de tareas para QR Quest v0"
---

# Tareas: QR Quest v0

**Entrada**: documentos de diseño en `/specs/001-qr-quest-v0/`

**Requisitos previos**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/interfaces.md](contracts/interfaces.md), [quickstart.md](quickstart.md)

**Pruebas**: solo se incluyen pruebas unitarias de lógica pura con Vitest (`normalizar`, `barajar`), tal como fija el plan. No hay pruebas de navegador automáticas: la verificación de cada historia es manual y sigue [quickstart.md](quickstart.md) (constitución, principio IV).

**Organización**: las tareas se agrupan por historia de usuario. La historia 5 (cuentas) va primero porque, aunque comparte prioridad P1 con las demás, es requisito de la historia 1.

## Formato: `[ID] [P?] [Historia] Descripción con ruta`

- **[P]**: se puede hacer en paralelo (archivos distintos, sin dependencias pendientes)
- **[USn]**: historia de usuario a la que pertenece la tarea
- Toda la interfaz y los mensajes en **español de España** (RF-018); sin librería de i18n
- Diseño móvil primero (≥ 320 px) con Tailwind CSS (RF-016)
- **Alcance**: no implementar nada que no esté en la spec (constitución, principio III)

## Convenciones de rutas

Proyecto único de Next.js en la raíz del repositorio (`app/`, `components/`, `lib/`, `supabase/`, `tests/`). No hay `backend/` ni `frontend/`.

---

## Fase 1: Preparación (infraestructura compartida)

**Propósito**: crear el proyecto y las herramientas básicas

- [X] T001 Crear el proyecto Next.js 14+ (App Router, TypeScript 5, Tailwind CSS, sin `src/`) en la raíz del repositorio, respetando los archivos ya existentes (`specs/`, `.specify/`, `.claude/`); Node.js 20 LTS (`"engines": {"node": ">=20"}` en `package.json`)
- [X] T002 Instalar dependencias en `package.json`: `@supabase/supabase-js`, `@supabase/ssr`, `qrcode.react`, `@dnd-kit/core` y, como desarrollo, `vitest`
- [X] T003 [P] Configurar Vitest en `vitest.config.ts` (entorno `node`, incluye `tests/unit/**/*.test.ts`) y añadir el script `"test": "vitest run"` en `package.json`
- [X] T004 [P] Crear `.env.example` con `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` (comentario: la clave de servicio nunca va al navegador) y asegurar que `.gitignore` excluye `.env.local`
- [X] T005 [P] Crear `lib/limites.ts` exportando `MAX_BYTES_IMAGEN = 4 * 1024 * 1024` y `MAX_IMAGENES_AVENTURA = 40` (RF-015)

---

## Fase 2: Fundamentos (bloquea todas las historias)

**Propósito**: base de datos, seguridad, clientes de Supabase y esqueleto de la app

**⚠️ CRÍTICO**: ninguna historia puede empezar hasta terminar esta fase

- [X] T006 Crear `supabase/migrations/0001_inicial.sql` con todo lo de [data-model.md](data-model.md):
  - Tabla `aventuras`: `id` uuid PK, `master_id` uuid → `auth.users` ON DELETE CASCADE, `nombre` texto NOT NULL con CHECK no vacío (`length(trim(nombre)) > 0`), `creada_en` timestamptz por defecto `now()`.
  - Tabla `puzzles`: `id` uuid PK, `aventura_id` uuid → `aventuras` ON DELETE CASCADE, `posicion` entero, `token` texto UNIQUE NOT NULL "aleatorio de 128 bits" (valor por defecto `encode(gen_random_bytes(16), 'hex')`), `titulo` texto opcional, `contrasena` texto. Disparador `BEFORE UPDATE` que impide modificar `token` ("generado al crear y nunca modificable").
  - Tabla `elementos`: `id` uuid PK, `puzzle_id` uuid → `puzzles` ON DELETE CASCADE, `parte` en (`enunciado`, `recompensa`), `posicion` entero ("orden dentro de su parte"), `tipo` en (`texto`, `imagen`), `texto` ("obligatorio si tipo = texto"), `ruta_imagen` ("ruta en el bucket; obligatoria si tipo = imagen"), `modo` en (`normal`, `difuminado`, `rompecabezas`) con valor por defecto `normal`. CHECK: `modo` distinto de `normal` solo es válido con `parte = recompensa` y `tipo = imagen`.
  - Disparador `BEFORE INSERT OR UPDATE OF tipo` en `elementos` que, cuando la fila resultante tiene `tipo = imagen`, cuenta las demás filas `tipo = imagen` de la aventura (vía `puzzles`), excluyendo la propia fila, y rechaza la 41.ª con un mensaje claro en español ("Máximo 40 imágenes por aventura"). Así cambiar un elemento de `texto` a `imagen` tampoco permite saltarse el límite.
  - RLS activada en las tres tablas: el master autenticado hace CRUD solo si `aventuras.master_id = auth.uid()` (en `puzzles` y `elementos`, a través de su aventura/puzzle); sin ninguna política para el rol anónimo.
  - Bucket privado `imagenes` con `file_size_limit` 4194304 (4 MB) y `allowed_mime_types` `image/*`; políticas de Storage para que el master solo suba, lea y borre bajo la carpeta `<auth.uid()>/` (ruta `"<master_id>/<aventura_id>/<uuid>.<ext>"`).
- [X] T007 [P] Crear `lib/supabase/cliente.ts`: cliente de navegador con `createBrowserClient` de `@supabase/ssr` usando la clave pública
- [X] T008 [P] Crear `lib/supabase/servidor.ts`: cliente de servidor con `createServerClient` de `@supabase/ssr` leyendo/escribiendo cookies con `next/headers` (respeta RLS con la sesión del master)
- [X] T009 [P] Crear `lib/supabase/admin.ts`: cliente con `SUPABASE_SERVICE_ROLE_KEY`, marcado con `import "server-only"` para que nunca llegue al navegador; sin persistir sesión
- [X] T010 Crear `middleware.ts` en la raíz: refresca la sesión de Supabase y redirige a `/entrar` cuando no hay sesión y la ruta empieza por `/aventuras`; `/p/*`, `/`, `/registro`, `/entrar`, `/recuperar` y `/restablecer` quedan públicas (constitución, principio VI)
- [X] T011 [P] Crear `app/layout.tsx` (con `<html lang="es-ES">`, título "QR Quest", fuente y fondo amables, contenedor con márgenes responsive) y `app/globals.css` con Tailwind y las reglas de impresión base (`@media print`)

**Punto de control**: base lista; ya se pueden construir las historias

---

## Fase 3: Historia 5 - Registro e inicio de sesión del master (Prioridad: P1) 🎯

**Objetivo**: el master se registra solo con correo y contraseña, entra, sale y recupera su contraseña por correo (RF-001, RF-011).

**Prueba independiente**: registrarse, cerrar sesión, volver a entrar y ver `/aventuras` vacía; sin sesión, `/aventuras` redirige a `/entrar`; pedir el enlace de "he olvidado mi contraseña", abrirlo y fijar una nueva (quickstart pasos 11 y 12).

### Implementación

- [X] T012 [P] [US5] Crear `app/(auth)/registro/page.tsx`: formulario con solo correo y contraseña (ningún otro dato, RF-001) que llama a `supabase.auth.signUp`; al terminar redirige a `/aventuras` sin pedir confirmación; muestra errores en español (correo ya usado, contraseña demasiado corta)
- [X] T013 [P] [US5] Crear `app/(auth)/entrar/page.tsx`: formulario de correo y contraseña con `signInWithPassword`, mensaje amable en español si son incorrectos, enlaces a `/registro` y a `/recuperar`; redirige a `/aventuras`
- [X] T014 [P] [US5] Crear `app/(auth)/recuperar/page.tsx`: pide el correo y llama a `resetPasswordForEmail` con `redirectTo` = `<origen>/restablecer`; muestra siempre el mismo mensaje de "Si el correo existe, te hemos enviado un enlace" (sin revelar qué correos tienen cuenta)
- [X] T015 [P] [US5] Crear `app/(auth)/restablecer/page.tsx`: al llegar desde el enlace del correo intercambia el código por sesión (`exchangeCodeForSession`), pide la nueva contraseña con `updateUser({ password })` y redirige a `/aventuras`; si el enlace es inválido o ha caducado, mensaje en español con enlace a `/recuperar`
- [X] T016 [P] [US5] Crear `app/page.tsx`: portada mínima con el nombre, una frase de qué es QR Quest y botones "Entrar" y "Crear cuenta"; si hay sesión, enlace a "Mis aventuras"
- [X] T017 [US5] Crear `components/CerrarSesion.tsx` (botón que llama a `signOut` y va a `/`) y una cabecera mínima de la zona master en `app/aventuras/layout.tsx` con el nombre, el enlace "Mis aventuras" y el botón de cerrar sesión

**Punto de control**: el master puede registrarse, entrar, salir y recuperar la contraseña

---

## Fase 4: Historia 1 - El master crea una aventura (Prioridad: P1) 🎯 MVP

**Objetivo**: crear, editar y eliminar aventuras con una cadena lineal de puzzles; cada puzzle con enunciado (textos e imágenes), contraseña y recompensa (≥ 1 elemento); el último puzzle es el mensaje de final (RF-002, RF-003, RF-004, RF-014, RF-015).

**Prueba independiente**: como master, crear una aventura con 3 puzzles, cerrar el navegador y reabrirla con todo guardado; subir una imagen de más de 4 MB y llegar a 41 imágenes y comprobar el mensaje claro (quickstart pasos 1, 7 y 8).

### Implementación

- [X] T018 [P] [US1] Crear `app/aventuras/actions.ts` (`"use server"`, cliente de `lib/supabase/servidor.ts`): `crearAventura(nombre)` (rechaza `nombre` vacío con mensaje en español; inserta con `master_id = auth.uid()`) y `eliminarAventura(id)` que primero borra del bucket `imagenes` todos los archivos bajo `<master_id>/<id>/` y después la fila (el borrado en cascada elimina puzzles y elementos, de modo que sus QR dejan de funcionar)
- [X] T019 [US1] Crear `app/aventuras/page.tsx`: lista las aventuras del master (nombre, fecha, nº de puzzles) con enlace a su editor, formulario "Nueva aventura" y botón "Eliminar" con confirmación en español; estado vacío amable (depende de T018)
- [X] T020 [P] [US1] Crear `components/SubidaImagen.tsx` (componente cliente, `lib/supabase/cliente.ts`): selector de archivo que antes de subir comprueba en el navegador que el tipo es `image/*` y que el tamaño no supera `MAX_BYTES_IMAGEN`, con mensajes en español claros ("Esta imagen pesa X MB; el máximo es 4 MB", "El archivo no es una imagen válida"); sube directo al bucket `imagenes` en `<master_id>/<aventura_id>/<uuid>.<ext>` y devuelve la ruta; traduce el error del almacén (archivo > 4 MB) al mismo mensaje; si el elemento no llega a crearse (el disparador lo rechaza o falla `crearElemento`), borra del bucket el archivo recién subido
- [X] T021 [P] [US1] Crear `app/aventuras/[id]/actions.ts` (`"use server"`) con: `renombrarAventura`, `crearPuzzle(aventuraId)` (nueva `posicion` = máxima + 1; el `token` lo genera la base de datos y nunca se envía desde la aplicación), `actualizarPuzzle(id, {titulo, contrasena})`, `eliminarPuzzle(id)` (borra antes los archivos de imagen de sus elementos y luego la fila), `moverPuzzle(id, "subir" | "bajar")` (intercambia `posicion` con el vecino; **nunca toca `token`**, RF-009), `crearElemento`, `actualizarElemento`, `eliminarElemento` (borra también su archivo si es imagen) y `moverElemento(id, "subir" | "bajar")` dentro de su `parte`; `crearElemento` y `actualizarElemento` traducen el error del disparador de 40 imágenes a "Esta aventura ya tiene 40 imágenes, el máximo permitido" (RF-015); si `crearElemento` falla con una imagen ya subida, borra ese archivo del bucket para no dejarlo huérfano
- [X] T022 [P] [US1] Crear `components/EditorElemento.tsx` (componente cliente): edita un elemento de una `parte` (`enunciado` o `recompensa`); alterna entre `texto` (textarea) e `imagen` (usa `SubidaImagen`, con vista previa); botones subir/bajar y eliminar; al descartar o sustituir una imagen aún no guardada, borra su archivo del bucket; para imágenes de **recompensa** muestra el selector `modo` (Normal / Difuminado / Rompecabezas, por defecto Normal); en el enunciado no muestra el selector (el CHECK de SQL solo permite `modo` ≠ `normal` en recompensa)
- [X] T023 [US1] Crear `app/aventuras/[id]/page.tsx`: editor de la aventura (devuelve `notFound()` si la aventura no es del master, porque RLS devuelve vacío); cabecera con nombre editable y enlace "Imprimir rejilla"; lista ordenada de puzzles con botones subir/bajar, título, campo `contrasena` (visible, texto claro) y dos secciones con `EditorElemento`: "Enunciado" y "Recompensa" (la del último puzzle se rotula "Mensaje de final de la aventura"); botón "Añadir puzzle"; aviso visible cuando la recompensa no tiene ningún elemento ("Una recompensa necesita al menos un texto o una imagen", RF-004); contador "N de 40 imágenes" (depende de T018, T020, T021, T022)

**Punto de control**: el master puede crear, editar y eliminar aventuras completas (MVP del lado del master)

---

## Fase 5: Historia 2 - El master imprime la rejilla de QR (Prioridad: P1)

**Objetivo**: rejilla imprimible con un QR por puzzle, con etiqueta, sin cortar ninguno entre páginas (RF-008, RF-009).

**Prueba independiente**: con una aventura creada, abrir la rejilla, usar la vista previa de impresión y escanear cada QR con un móvil (quickstart pasos 2, 8 y 9).

### Implementación

- [X] T024 [P] [US2] Crear `components/RejillaQR.tsx` (componente cliente): recibe `nombreAventura` y la lista ordenada de `{ token, numero }`; construye cada URL como `window.location.origin + "/p/" + token`, pinta el QR con `QRCodeSVG` de `qrcode.react` (nivel de corrección `M`, margen incluido) y la etiqueta "`<Nombre de la aventura> · Puzzle N`"; cuadrícula con Tailwind (2 columnas en móvil, 3 en pantallas grandes) y, para impresión, `break-inside: avoid` en cada celda y `@media print` que oculta cabecera y botones y fija 3 columnas
- [X] T025 [US2] Crear `app/aventuras/[id]/rejilla/page.tsx`: carga la aventura y sus puzzles (con sus elementos de recompensa) con el cliente de servidor; `notFound()` si no es del master; **no genera la rejilla** y muestra en su lugar un mensaje en español con qué falta cuando (a) no hay puzzles, (b) algún puzzle no tiene contraseña o (c) alguna recompensa no tiene al menos un elemento, indicando el número de puzzle afectado y enlazando al editor; si todo es válido, muestra `RejillaQR` y un botón "Imprimir" (`window.print()`) (depende de T024)

**Punto de control**: se puede imprimir la rejilla y los QR abren la URL `/p/<token>`

---

## Fase 6: Historia 3 - El jugador resuelve un puzzle y obtiene la recompensa (Prioridad: P1)

**Objetivo**: el jugador sin cuenta escanea el QR, ve el enunciado, escribe la contraseña y, solo si acierta, ve la recompensa; el último puzzle muestra el mensaje de final (RF-010, RF-011, RF-012, RF-013).

**Prueba independiente**: abrir `/p/<token>` real, probar contraseñas erróneas (sin límite, mensaje amable) y la correcta con otras mayúsculas/tildes; abrir una dirección inventada y ver "Este puzzle ya no existe" (quickstart pasos 3, 6, 9 y 10).

### Pruebas unitarias de la historia

- [X] T026 [P] [US3] Crear `tests/unit/normalizar.test.ts` (Vitest) con casos: `"  Árbol "` → `"arbol"`; `"CAFÉ"` → `"cafe"`; `"Ñandú"` → `"nandu"`; cadena vacía → `""`; dos textos que solo difieren en mayúsculas/tildes/espacios extremos normalizan igual; espacios interiores se conservan. Escribirlo antes de T027 y comprobar que falla

### Implementación

- [X] T027 [P] [US3] Crear `lib/normalizar.ts` exportando `normalizar(texto: string): string` que recorta espacios extremos, pasa a minúsculas y quita tildes con `texto.normalize("NFD").replace(/\p{Diacritic}/gu, "")` (RF-012); debe pasar T026
- [X] T028 [US3] Crear `app/p/[token]/actions.ts` (`"use server"`, `import "server-only"` de `lib/supabase/admin.ts`) con `comprobarContrasena(token: string, intento: string)` según [contracts/interfaces.md](contracts/interfaces.md): busca el puzzle **por token** con el cliente admin; si no existe → `{ ok: false, mensaje: "Este puzzle ya no existe." }`; compara `normalizar(intento)` con `normalizar(contrasena)`; si no coincide → `{ ok: false, mensaje: "Esa no es la contraseña. ¡Inténtalo de nuevo!" }`; si coincide → `{ ok: true, recompensa }` con los elementos `parte = recompensa` ordenados por `posicion`: `{ tipo: "texto", texto }` o `{ tipo: "imagen", url, modo }` con `url` firmada de 1 h (`createSignedUrl(ruta, 3600)`) y `modo` solo para imágenes. No registra ni guarda nada del intento y no limita intentos (RF-013) (depende de T027)
- [X] T029 [P] [US3] Crear `components/Recompensa.tsx` (componente cliente): recibe la lista `recompensa` y la pinta en orden; textos como párrafos y cada imagen en modo `normal` con `<img>` responsive (`max-w-full`, `h-auto`); para `difuminado` y `rompecabezas` renderiza por ahora la imagen normal (los modos se implementan en la historia 4, T034 y T035)
- [X] T030 [US3] Crear `app/p/[token]/page.tsx` (componente de servidor, cliente admin): busca el puzzle por `token`; si no existe, página amable "Este puzzle ya no existe" idéntica para tokens borrados y nunca creados; si existe, envía al navegador **solo** título, textos e imágenes del **enunciado** (URLs firmadas de 1 h); **nunca** `contrasena` ni elementos de recompensa (contrato "Contenido de `/p/[token]`"); incluye el formulario de contraseña como componente cliente (`components/FormularioContrasena.tsx` en este mismo paso) que llama a `comprobarContrasena`, muestra el mensaje amable en caso de fallo permitiendo reintentar sin límite, y al acertar sustituye el formulario por `Recompensa`; el estado vive solo en el navegador, de modo que recargar vuelve al principio (depende de T028, T029)
- [X] T031 [P] [US3] Crear `app/p/[token]/not-found.tsx` y `app/not-found.tsx` con el mensaje amable en español y enlace a la portada, para que cualquier ruta inexistente del juego no revele ningún otro contenido (CE-007)
- [X] T032 [US3] Marcar el último puzzle en la vista del jugador: en `app/p/[token]/page.tsx` y `comprobarContrasena` comprobar si el puzzle tiene la mayor `posicion` de su aventura y, en ese caso, rotular la recompensa como "¡Fin de la aventura!" antes de los elementos (el mensaje de final es la recompensa del último puzzle, plan decisión 8) (depende de T030)

**Punto de control**: el juego básico funciona de extremo a extremo (escanear → contraseña → recompensa/fin)

---

## Fase 7: Historia 4 - Recompensas con difuminado o rompecabezas (Prioridad: P2)

**Objetivo**: cada imagen de recompensa puede mostrarse normal, difuminada (revelable) o como rompecabezas 3×3 que se recompone arrastrando con ratón o dedo (RF-005, RF-006, RF-007).

**Prueba independiente**: configurar una recompensa con una imagen difuminada y otra en rompecabezas y jugarlas desde un móvil y un ordenador (quickstart paso 4).

### Pruebas unitarias de la historia

- [X] T033 [P] [US4] Crear `tests/unit/barajar.test.ts` (Vitest): para varios tamaños (4, 9) comprobar que `barajar(n)` devuelve una permutación de `0..n-1` y que **nunca** devuelve el orden resuelto `[0,1,…,n-1]` (repetir 200 veces); `n < 2` devuelve el orden tal cual. Escribirlo antes de T034 y comprobar que falla

### Implementación

- [X] T034 [P] [US4] Crear `lib/barajar.ts` exportando `barajar(n: number): number[]` (Fisher-Yates sobre `[0..n-1]`; si el resultado coincide con el orden resuelto, repetir o rotar una posición) y `estaResuelto(orden: number[]): boolean`; debe pasar T033
- [X] T035 [P] [US4] Crear `components/Rompecabezas.tsx` (componente cliente): recibe `url`, y opcionalmente `alAcabar`; cuadrícula fija 3×3 cuyo contenedor usa la proporción real de la imagen (`aspect-ratio` tomado de `naturalWidth/naturalHeight` al cargar) para que sea jugable con imágenes pequeñas o de proporciones extremas; cada pieza se pinta con `background-image` + `background-size: 300% 300%` + `background-position` (sin canvas); orden inicial con `barajar(9)`; intercambio de piezas arrastrando con `@dnd-kit/core` (`DndContext`, `useDraggable` y `useDroppable`, con `PointerSensor` y `TouchSensor` para ratón y táctil, `touch-action: none` en las piezas); cuando `estaResuelto` se muestra la imagen completa y se llama a `alAcabar`; texto de ayuda en español ("Arrastra los trozos para recomponer la imagen")
- [X] T036 [P] [US4] Crear `components/ImagenDifuminada.tsx` (componente cliente): imagen con filtro CSS `blur()` (p. ej. `blur-xl`) y `transition`; al pulsar/tocar o mantener pulsado se quita con transición suave y botón accesible "Revelar imagen" (un clic/pulsación) (RF-006)
- [X] T037 [US4] Actualizar `components/Recompensa.tsx` para renderizar según `modo`: `normal` → imagen, `difuminado` → `ImagenDifuminada`, `rompecabezas` → `Rompecabezas`; cuando una recompensa contiene imágenes en rompecabezas, los textos de la recompensa (la pista) se muestran solo cuando **todos** los rompecabezas están resueltos (historia 4, escenario 2); cada imagen se rige por su propio modo (depende de T035, T036)

**Punto de control**: las tres modalidades de imagen funcionan en móvil y ordenador

---

## Fase 8: Pulido y verificación final

**Propósito**: calidad transversal y comprobación con la guía manual

- [X] T038 [P] Revisar todas las pantallas a 320 px, tableta y ordenador (sin desbordes ni elementos cortados, CE-006 y RF-016): corregir clases de Tailwind en `app/`, `components/` y `app/globals.css`
- [X] T039 [P] Revisar que **todos** los textos visibles y los mensajes de error están en español de España (RF-018, constitución II) en `app/` y `components/`, incluidos `aria-label`, `placeholder` y títulos de página; pulir el aspecto para que sea amable y atractivo (RF-017) sin añadir funciones nuevas
- [X] T040 Comprobar que no se filtra nada al navegador del jugador: buscar con Grep que `SUPABASE_SERVICE_ROLE_KEY` y `lib/supabase/admin.ts` solo se usan en archivos de servidor (`app/p/[token]/*`), que `contrasena` y los elementos de recompensa no aparecen en la respuesta de `app/p/[token]/page.tsx` y que no existe ninguna ruta pública que liste puzzles (CE-004, CE-007)
- [X] T041 Comprobar que no queda código fuera de alcance (sin analítica, sin intentos limitados, sin roles, sin papelera, sin guardado de progreso, sin i18n) y que `npm test` y `npm run build` terminan sin errores
- [ ] T042 Ejecutar la guía de [quickstart.md](quickstart.md) sección 4 (pasos 1 a 13) con la app en marcha y anotar cualquier paso que falle; el paso 13 (coste 0 €) se verifica tras publicar en Vercel; incluir el paso 14 (CE-010)

---

## Dependencias y orden de ejecución

### Dependencias entre fases

- **Preparación (Fase 1)**: sin dependencias; empieza ya
- **Fundamentos (Fase 2)**: depende de la Fase 1; **bloquea** todas las historias
- **Historias (Fases 3 a 7)**: todas dependen de la Fase 2
- **Pulido (Fase 8)**: depende de las historias que se vayan a entregar

### Dependencias entre historias

```text
Fase 1 → Fase 2 ─┬→ US5 (cuentas) → US1 (crear aventura) ─┬→ US2 (rejilla)
                 │                                        └→ US3 (jugar) → US4 (difuminado/rompecabezas)
                 └→ (US3 puede construirse en paralelo a US1/US2 con datos insertados a mano en Supabase)
```

- **US5**: tras Fundamentos; las demás historias del master necesitan sesión
- **US1**: tras US5 (necesita sesión y `/aventuras`)
- **US2**: tras US1 (necesita aventuras y puzzles reales); no depende de US3
- **US3**: el código de jugador no depende de la zona master, pero para probarlo de extremo a extremo se necesitan datos de US1
- **US4**: tras US3 (amplía `Recompensa.tsx`)

### Dentro de cada historia

- Las pruebas unitarias (T026, T033) se escriben primero y deben fallar antes de la implementación
- Lógica pura (`lib/`) antes de acciones de servidor; acciones antes de páginas; componentes antes de las páginas que los usan

### Oportunidades de paralelismo

- Fase 1: T003, T004 y T005 a la vez tras T001/T002
- Fase 2: T007, T008, T009 y T011 a la vez (T006 y T010 en serie con lo demás)
- US5: T012 a T016 a la vez (archivos distintos)
- US1: T018, T020, T021 y T022 a la vez; después T019 y T023
- US3: T026/T027, T029 y T031 a la vez
- US4: T033/T034, T035 y T036 a la vez
- Con varias personas: tras Fundamentos, una persona puede hacer US3 mientras otra hace US5 → US1 → US2

---

## Ejemplo de paralelismo: Historia 1

```text
# Lanzar a la vez (archivos distintos):
Tarea: "Crear app/aventuras/actions.ts" (T018)
Tarea: "Crear components/SubidaImagen.tsx" (T020)
Tarea: "Crear app/aventuras/[id]/actions.ts" (T021)
Tarea: "Crear components/EditorElemento.tsx" (T022)

# Después, en serie:
Tarea: "Crear app/aventuras/page.tsx" (T019)
Tarea: "Crear app/aventuras/[id]/page.tsx" (T023)
```

---

## Estrategia de implementación

### Primero el MVP

1. Fase 1 (Preparación) y Fase 2 (Fundamentos)
2. Fase 3 (US5, cuentas) y Fase 4 (US1, crear aventura)
3. Fase 5 (US2, rejilla) y Fase 6 (US3, jugar): con esto el juego es utilizable de extremo a extremo
4. **PARAR y VALIDAR** con quickstart pasos 1 a 3 y 6 a 12
5. Publicar y demostrar si está listo

### Entrega incremental

1. Preparación + Fundamentos → base lista
2. US5 + US1 → el master crea aventuras
3. US2 → se pueden imprimir los QR
4. US3 → los jugadores pueden jugar (**MVP completo**)
5. US4 → difuminado y rompecabezas (P2)
6. Pulido y verificación final

---

## Notas

- [P] = archivos distintos, sin dependencias pendientes
- El `token` del puzzle lo genera solo la base de datos y nunca se actualiza (RF-009, RF-010)
- Confirmar el correo desactivado, el SMTP de Resend y las URL de redirección son pasos de configuración manual en Supabase descritos en [quickstart.md](quickstart.md) sección 1 y 3, no tareas de código
- Hacer commit tras cada tarea o grupo lógico
- Evitar: tareas vagas, conflictos en un mismo archivo y dependencias entre historias que rompan su independencia
