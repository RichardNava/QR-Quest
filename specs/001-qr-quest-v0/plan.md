# Plan de implementación: QR Quest v0

**Rama**: `001-qr-quest-v0` | **Fecha**: 2026-10-12 | **Spec**: [spec.md](spec.md)

**Entrada**: especificación en `/specs/001-qr-quest-v0/spec.md`

## Resumen

QR Quest es una web con dos caras: una zona privada donde el master crea aventuras e imprime su rejilla de QR, y una zona pública (`/p/<código>`) a la que el jugador llega escaneando un QR.

El enfoque es el más corto posible para publicar ya y a coste cero: **una sola aplicación Next.js** desplegada en Vercel, con **Supabase** (plan gratuito) como base de datos, sistema de cuentas y almacén de imágenes. No hay servidor propio, ni colas, ni caché, ni panel de administración, ni nada que la spec no pida.

## Decisiones importantes, explicadas sin jerga

> Cada decisión responde a la pregunta "¿qué es lo más simple que cumple la spec?". El detalle y las alternativas descartadas están en [research.md](research.md).

1. **Una sola aplicación, no dos.** Podríamos haber hecho un "frontend" y un "backend" separados, pero eso son dos cosas que desplegar, conectar y mantener. Con Next.js la misma aplicación pinta las pantallas y ejecuta la lógica privada (comprobar contraseñas). Un proyecto, un despliegue.

2. **No construimos el sistema de cuentas: lo alquilamos gratis.** Registro, inicio de sesión y el correo de "he olvidado mi contraseña" son fáciles de hacer mal y largos de hacer bien. Supabase los trae hechos y gratuitos. Así la contraseña del master nunca pasa por código nuestro. Dos ajustes: desactivamos la confirmación por correo en el registro (la spec dice que el master entra sin más trámites) y configuramos un servicio de correo gratuito (Resend) para que el enlace de recuperación llegue a *cualquier* master, porque el correo de pruebas de Supabase solo escribe a los miembros del proyecto.

3. **El código del QR es un número al azar, no un número de orden.** La constitución pide que la dirección no sea adivinable. En vez de cifrar el número del puzzle (lo que exige guardar claves y descifrar), cada puzzle recibe al crearse un código aleatorio de 128 bits (`/p/k3J9...`). Es imposible de adivinar o deducir, hace lo mismo que "cifrar" a efectos de seguridad, y además resuelve gratis un requisito: como el código pertenece al puzzle y no a su posición, reordenar o editar la aventura **no rompe los QR ya impresos**.

4. **La contraseña se comprueba en el servidor, nunca en el móvil del jugador.** Si la página enviara la recompensa al móvil y la ocultara con código, cualquiera podría verla. Por eso la página del puzzle solo recibe el enunciado; la recompensa (textos y fotos) viaja únicamente cuando el servidor confirma que la contraseña es correcta. Las imágenes están en un almacén privado y se entregan con enlaces temporales.

5. **El master sube las fotos directamente al almacén.** Las funciones gratuitas de Vercel rechazan peticiones de más de ~4,5 MB, y nuestro límite por imagen es 4 MB más el envoltorio. Subiendo directo al almacén evitamos ese techo sin código extra; el propio almacén rechaza lo que pese más de 4 MB y un pequeño control en la base de datos impide pasar de 40 imágenes por aventura.

6. **Difuminado con CSS; rompecabezas con una librería de arrastrar y soltar.** El difuminado es un filtro del navegador y un clic/pulsación para quitarlo: casi cero código. El rompecabezas trocea la imagen con CSS (sin canvas) y usa `@dnd-kit`, que ya funciona bien con dedo y con ratón. Escribir nuestro propio arrastre táctil es donde aparecen los errores.

7. **Reordenar puzzles con flechas "subir/bajar", no arrastrando.** Es más simple, funciona igual de bien en móvil y la spec solo pide "cadena lineal", no una forma concreta de ordenarla.

8. **Un puzzle, una tabla de "elementos".** Los textos e imágenes del enunciado y de la recompensa son el mismo tipo de cosa (un texto o una imagen con un modo). Una sola tabla `elementos` con una marca "enunciado/recompensa" evita duplicar tablas y pantallas. El mensaje de final es simplemente la recompensa del último puzzle.

9. **Sin pruebas de navegador automáticas.** Pruebas unitarias para la lógica delicada (comparar contraseñas sin mayúsculas ni tildes, barajar el rompecabezas) y una guía de comprobación manual ([quickstart.md](quickstart.md)) que cualquier persona puede seguir con la app delante, tal como pide la constitución (principio IV).

### Cosas que conviene saber antes de publicar

- **Supabase gratuito pausa el proyecto tras ~7 días sin uso.** Se reactiva con un clic, pero un QR escaneado durante la pausa fallaría. Para un evento puntual: abrir la web el día antes. No añadimos tareas programadas para evitarlo (sería infraestructura no pedida).
- **Vercel Hobby es para uso no comercial.** Encaja con aventuras familiares/de ocio; si algún día se monetiza habría que revisarlo.
- **"Coste cero" (CE-009) se cumple con los planes gratuitos de Vercel, Supabase y Resend**, con sus límites (1 GB de imágenes, 500 MB de base de datos, ~3.000 correos/mes), holgados para la v1.

## Contexto técnico

**Lenguaje/Versión**: TypeScript 5 sobre Node.js 20 LTS

**Dependencias principales**: Next.js 14+ (App Router), React, Tailwind CSS, `@supabase/supabase-js` + `@supabase/ssr`, `qrcode.react`, `@dnd-kit/core`

**Almacenamiento**: Supabase Postgres (datos) + Supabase Storage (bucket privado `imagenes`, límite 4 MB por archivo, solo imágenes)

**Pruebas**: Vitest (lógica pura) + guía manual de [quickstart.md](quickstart.md)

**Plataforma objetivo**: navegadores modernos en móvil (≥320 px), tableta y ordenador; alojado en Vercel (Hobby)

**Tipo de proyecto**: aplicación web única

**Objetivos de rendimiento**: del escaneo del QR a ver el puzzle en pocos segundos con 4G (CE-003); sin objetivos de carga (uso familiar/evento)

**Restricciones**: coste cero; todo en español de España; sin guardar progreso de jugadores; ninguna página de puzzle accesible sin su código

**Escala/Alcance**: decenas de masters, aventuras de ≤ decenas de puzzles, ≤ 40 imágenes por aventura. 5 pantallas de master y 1 de jugador

## Comprobación de la constitución

| Principio | ¿Cumple? | Cómo |
|---|---|---|
| I. Simplicidad ante todo | ✅ | Una app, servicios gestionados gratuitos, sin capas intermedias (sin ORM, sin API REST aparte, sin estado global, sin i18n) |
| II. Español de España | ✅ | Textos de interfaz fijos en español; documentación del plan en español |
| III. Cero alcance fantasma | ✅ | Solo lo de RF-001…RF-018. Sin límite de intentos extra, sin analítica, sin roles, sin papelera, sin "recordar jugador" |
| IV. Verificable por no técnico | ✅ | [quickstart.md](quickstart.md) mapea cada criterio CE-001…CE-010 a una comprobación manual |
| V. Bien securizada | ✅ | Código de puzzle aleatorio de 128 bits; recompensa y contraseña solo salen del servidor tras acertar; bucket privado; RLS en todas las tablas |
| VI. Login solo master | ✅ | Solo `/aventuras/*` exige sesión; `/p/*` es público y sin cuenta |

**Resultado**: sin violaciones. La tabla de complejidad no es necesaria.

**Reevaluación tras el diseño (Fase 1)**: se mantiene todo en verde. El diseño añadió únicamente un disparador SQL (límite de 40 imágenes) porque RF-015 lo exige y el almacén no sabe contar por aventura.

## Estructura del proyecto

### Documentación (esta funcionalidad)

```text
specs/001-qr-quest-v0/
├── plan.md          # Este archivo
├── research.md      # Fase 0: decisiones y alternativas descartadas
├── data-model.md    # Fase 1: tablas, reglas y seguridad
├── quickstart.md    # Fase 1: cómo ponerlo en marcha y comprobarlo
├── contracts/
│   └── interfaces.md  # Fase 1: rutas y acciones del servidor
└── tasks.md         # Fase 2 (lo crea /speckit-tasks, no este comando)
```

### Código fuente (raíz del repositorio)

```text
app/
├── page.tsx                        # Portada mínima con enlaces a entrar/registrarse
├── (auth)/
│   ├── entrar/page.tsx
│   ├── registro/page.tsx
│   ├── recuperar/page.tsx          # Pide el correo
│   └── restablecer/page.tsx        # Fija la nueva contraseña
├── aventuras/                      # Zona master (requiere sesión)
│   ├── page.tsx                    # Lista de aventuras
│   ├── [id]/page.tsx               # Editor: puzzles, elementos, orden
│   └── [id]/rejilla/page.tsx       # Rejilla imprimible de QR
├── p/[token]/
│   ├── page.tsx                    # Enunciado del puzzle (público)
│   └── actions.ts                  # comprobarContrasena(token, texto)
└── layout.tsx
components/
├── Recompensa.tsx                  # Normal / difuminado / rompecabezas
├── Rompecabezas.tsx
├── EditorElemento.tsx
└── SubidaImagen.tsx
lib/
├── supabase/{cliente,servidor,admin}.ts
├── normalizar.ts                   # minúsculas + sin tildes + sin espacios extremos
├── barajar.ts
└── limites.ts                      # 4 MB, 40 imágenes
middleware.ts                       # Protege /aventuras
supabase/migrations/0001_inicial.sql
tests/unit/{normalizar,barajar}.test.ts
```

**Decisión de estructura**: proyecto único de Next.js en la raíz. No hay carpeta `backend/` ni `frontend/`; la lógica privada vive en acciones de servidor dentro de `app/`.

## Seguimiento de complejidad

Sin violaciones de la constitución que justificar.
