# Investigación (Fase 0): QR Quest v0

No quedaban "NEEDS CLARIFICATION" en el contexto técnico; este documento recoge las decisiones tomadas y por qué, priorizando la simplicidad (constitución, principio I).

## 1. Plataforma y alojamiento

- **Decisión**: Next.js (App Router, TypeScript) en Vercel Hobby.
- **Por qué**: una sola app sirve pantallas y lógica privada; despliegue conectando el repositorio; gratuito; HTTPS incluido (necesario para que el móvil abra los QR sin avisos).
- **Alternativas descartadas**: frontend SPA + API aparte (dos despliegues, más piezas); servidor propio/VPS (coste y mantenimiento); HTML estático (no puede guardar la contraseña a salvo del jugador).

## 2. Cuentas del master

- **Decisión**: Supabase Auth con correo y contraseña; confirmación de correo desactivada; recuperación con enlace por correo vía SMTP gratuito de Resend.
- **Por qué**: cumple RF-001 y la aclaración de recuperación sin escribir código de seguridad. Con confirmación desactivada el master entra al instante (historia 5, escenario 1).
- **Matiz**: el correo integrado de Supabase solo envía a miembros del proyecto y con tope muy bajo; sin SMTP propio, la recuperación fallaría para masters reales.
- **Alternativas**: Auth.js + tabla de usuarios propia (más código, hay que enviar correos igualmente); Firebase Auth (equivalente, pero obligaría a separar la base de datos de las cuentas).

## 3. Datos e imágenes

- **Decisión**: Supabase Postgres + Storage (bucket privado), con RLS para que cada master solo vea lo suyo.
- **Por qué**: persistencia (RF-014) y propiedad (RF-002, historia 5.2) resueltas en la base de datos, no en código que pueda olvidarse. Un mismo proveedor reduce piezas.
- **Sin ORM**: consultas directas con el cliente de Supabase; un ORM sería una capa más sin beneficio a este tamaño.
- **Límites (RF-015)**: 4 MB por archivo y solo tipos de imagen se configuran en el bucket (el rechazo real, en servidor); la interfaz lo comprueba antes para dar un mensaje claro. El máximo de 40 por aventura lo impone un disparador SQL en la tabla `elementos`, que salta tanto al insertar como al actualizar el `tipo` (así cambiar un elemento de texto a imagen tampoco permite superar el límite).
- **Alternativas**: guardar imágenes en la base de datos como binarios (infla los 500 MB gratuitos); Cloudinary/S3 (otra cuenta y claves).

## 4. Dirección no adivinable (RF-010, principio V)

- **Decisión**: cada puzzle tiene un `token` aleatorio de 128 bits (UUID v4 sin guiones o equivalente en base64url), único e inmutable; la URL es `/p/<token>`.
- **Por qué**: un valor aleatorio no se puede deducir de nada, que es lo que la constitución persigue con "cifrado". Cifrar el id secuencial exigiría gestionar una clave y daría una URL derivable si la clave se filtra. Además, al estar ligado al puzzle y no a su posición, se cumple RF-009 sin esfuerzo.
- **Alternativas**: id secuencial cifrado con AES (clave que custodiar); id firmado (JWT) (más largo, QR más denso y menos legible al imprimir).
- **Nota**: la interfaz de master y la base de datos no exponen los tokens de otros masters (RLS).

## 5. Comprobación de la contraseña (RF-012, CE-004)

- **Decisión**: acción de servidor `comprobarContrasena(token, texto)` con la clave de servicio de Supabase. Normaliza ambos textos (recortar espacios, minúsculas, quitar tildes con `normalize("NFD")`) y compara. Si coincide devuelve los elementos de recompensa con enlaces firmados temporales; si no, un error amable.
- **Por qué**: el navegador del jugador nunca recibe la contraseña ni la recompensa antes de acertar. Sin límite de intentos (lo pide la spec).
- **Contraseña guardada en texto claro**: el master debe poder verla y editarla; es un código de juego, no una credencial de cuenta. Se protege con RLS, y el jugador nunca puede leerla.
- **Alternativas**: comparar en el cliente (inseguro); guardar un hash (el master no podría ver su propia contraseña al editar).

## 6. Recompensas con modos (RF-005…RF-007)

- **Difuminado**: filtro CSS `blur()` sobre la imagen; al pulsar o mantener, se quita con transición. La imagen original ya llega al navegador tras acertar la contraseña, lo cual es aceptable: el difuminado es un reto de juego, no una protección.
- **Rompecabezas**: cuadrícula fija (3×3) con `background-position` sobre la imagen; las piezas se barajan en el cliente y se reordenan con `@dnd-kit/core` (soporta ratón y táctil). Se consideran resuelto cuando el orden coincide. El 3×3 mantiene jugable incluso con imágenes pequeñas o de proporciones extremas, porque las piezas respetan la proporción de la imagen.
- **Alternativas**: canvas (más código); intercambiar piezas con dos toques (más simple aún, pero la spec dice arrastrar y soltar); HTML5 drag-and-drop nativo (no funciona en táctil).

## 7. QR e impresión (RF-008, RF-009)

- **Decisión**: `qrcode.react` pinta cada QR como SVG en el navegador; la URL se construye con `window.location.origin` + `/p/<token>`. La página de rejilla usa CSS de impresión (`@media print`, cuadrícula, `break-inside: avoid`) y el master imprime con el diálogo del navegador.
- **Por qué**: SVG es nítido a cualquier tamaño (CE-002); no hace falta generador de PDF ni servicio externo; la variable de dominio no es necesaria.
- **Etiqueta**: número de puzzle y nombre de la aventura bajo cada QR.

## 8. Orden de puzzles

- **Decisión**: columna `posicion` entera y botones subir/bajar.
- **Por qué**: lista lineal (RF-003) sin librería extra; funciona igual en móvil.

## 9. Interfaz y español

- **Decisión**: Tailwind CSS, diseño móvil primero (320 px), textos en español de España escritos directamente en los componentes. Sin librería de internacionalización (la spec descarta otros idiomas).

## 10. Pruebas

- **Decisión**: Vitest para `normalizar` (mayúsculas, tildes, espacios) y `barajar` (nunca devuelve el orden resuelto). El resto se valida con [quickstart.md](quickstart.md), mapeado a los criterios de éxito.
- **Alternativas**: Playwright (útil, pero montar y mantener E2E excede lo que necesita una v1 y la constitución pide verificación manual no técnica).
