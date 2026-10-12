# Guía de arranque y comprobación: QR Quest v0

Sirve para poner la app en marcha y para que **una persona no técnica** compruebe los criterios de éxito usando solo la aplicación (constitución, principio IV).

## 1. Requisitos (una sola vez)

1. Cuentas gratuitas: **Supabase**, **Vercel** y **Resend** (correo).
2. En Supabase: crear un proyecto; ejecutar `supabase/migrations/0001_inicial.sql` (crea tablas, reglas de seguridad, bucket `imagenes` y el límite de 40 imágenes); en *Authentication* desactivar "Confirm email" y configurar el SMTP de Resend.
3. Guardar en un archivo `.env.local` (y en Vercel): URL del proyecto, clave pública y clave de servicio de Supabase. La clave de servicio **nunca** va al navegador.

## 2. Arranque en local

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # pruebas de lógica (normalizar y barajar)
```

## 3. Publicar

Conectar el repositorio a Vercel, añadir las variables de entorno y desplegar. Tras publicar, añadir la URL final en Supabase → Authentication → URL de redirección (para el enlace de recuperar contraseña).

## 4. Comprobación manual (con el móvil en la mano)

| # | Pasos | Resultado esperado | Criterio |
|---|---|---|---|
| 1 | Registrarse con correo y contraseña, crear una aventura de 5 puzzles con textos, imágenes, contraseña y recompensa, abrir la rejilla | Todo queda listo en < 20 min, sin ayuda | CE-001 |
| 2 | Imprimir (o vista previa) la rejilla y escanear cada QR con el móvil | Cada QR abre su puzzle; ninguno cortado entre páginas | CE-002 |
| 3 | En un puzzle, escribir una contraseña mala varias veces, luego la buena (cambiando mayúsculas y tildes) | Mensaje amable al fallar, sin límite; la recompensa solo sale con la buena | CE-003, CE-004 |
| 4 | Configurar una recompensa difuminada y otra como rompecabezas; jugarlas en móvil y en ordenador | Se revela la imagen; las piezas se arrastran con dedo y ratón; al acabar sale la pista | CE-005 |
| 5 | Abrir cada pantalla a 320 px (móvil), tableta y ordenador | Sin desbordes ni elementos cortados | CE-006 |
| 6 | Modificar a mano la dirección de un puzzle (cambiar caracteres) o probar una inventada | Mensaje "ya no existe"; nunca se muestra otra página del juego | CE-007 |
| 7 | Subir una imagen de más de 4 MB y llegar a 41 imágenes en una aventura | Mensaje claro con el límite y no se guarda | CE-008 |
| 8 | Reordenar puzzles y editar uno; volver a escanear un QR impreso antes | El QR sigue abriendo su puzzle | RF-009 |
| 9 | Borrar un puzzle y escanear su QR | Mensaje amable de que ya no existe | RF-009 |
| 10 | Recargar tras acertar | Vuelve al principio y pide la contraseña | RF-013 |
| 11 | "He olvidado mi contraseña": pedir el enlace y fijar una nueva | Llega el correo y se puede volver a entrar | Historia 5 |
| 12 | Sin sesión, abrir `/aventuras`; con otro master, intentar abrir una aventura ajena | Redirige a entrar / "no encontrada" | RF-002 |
| 13 | Revisar en los paneles de Vercel, Supabase y Resend que no hay cobros | Coste 0 € | CE-009 |

Detalles de tablas en [data-model.md](data-model.md) y de rutas en [contracts/interfaces.md](contracts/interfaces.md).
