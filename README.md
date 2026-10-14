# QR Quest 🧭

Aplicación web para crear **búsquedas del tesoro con códigos QR**. Un *master* diseña una aventura (una cadena lineal de puzzles), imprime la rejilla de QR y la reparte por el barrio, la casa rural o el salón del evento. Los jugadores escanean cada QR con el móvil, resuelven el puzzle con una contraseña y obtienen una recompensa con la pista hacia el siguiente QR. **Los jugadores no necesitan cuenta.**

Toda la interfaz está en español de España.

## Funcionalidades

**Para el master (con cuenta)**
- Registro, inicio de sesión y recuperación de contraseña por correo.
- Crear, renombrar y eliminar aventuras.
- Editar puzzles: título editable en la propia cabecera (por defecto «Puzzle N»), enunciado (textos e imágenes), contraseña y recompensa (varios textos e imágenes, mínimo un elemento). Reordenar puzzles. La cabecera de cada puzzle queda fija al hacer scroll para saber siempre en cuál se trabaja.
- Enunciado (ámbar) y recompensa (verde) se distinguen por color, y los botones «Añadir texto / imagen / minijuego» comparten barra y estilo.
- Contraseña **numérica o alfanumérica** mediante un interruptor. Si es numérica, el jugador ve una casilla por dígito.
- Modos por imagen en la recompensa: **normal**, **difuminada** o **rompecabezas** (arrastrar y soltar).
- **Minijuegos generados automáticamente** (opcionales, uno por puzzle): Rush Hour, Lights Out, Mastermind, Sudoku y Laberinto, en tres niveles de dificultad. Se crean con un algoritmo propio (sin IA ni servicios externos) desde el botón «Añadir minijuego» del enunciado, con vista previa y «Generar de nuevo».
- Rejilla de QR imprimible, con etiqueta "Aventura · Puzzle N" y sin QR cortados entre páginas.
- Los QR impresos siguen funcionando aunque se reordenen o editen otros puzzles; un puzzle borrado muestra un mensaje amable de que ya no existe.

**Para el jugador (sin cuenta)**
- Escanea el QR y ve el enunciado en `/p/<token>`.
- La contraseña no distingue mayúsculas, minúsculas ni tildes; intentos ilimitados. Si es numérica se introduce dígito a dígito (solo se revela su longitud).
- Si el puzzle tiene minijuego, las reglas se consultan con el icono «?» (al pasar el ratón, enfocarlo o tocarlo); al resolverlo se muestra la contraseña del puzzle para escribirla en el campo habitual (también se puede escribir directamente sin jugar).
- La recompensa solo se envía al navegador tras acertar. Recargar la página vuelve a pedir la contraseña.

## Tecnología

- [Next.js 14](https://nextjs.org/) (App Router) · React 18 · TypeScript
- [Tailwind CSS](https://tailwindcss.com/) con una paleta única en `app/globals.css`
- [Supabase](https://supabase.com/): autenticación, Postgres con RLS y Storage (bucket `imagenes`)
- [`@dnd-kit`](https://dndkit.com/) para el rompecabezas · [`qrcode.react`](https://github.com/zpao/qrcode.react) para los QR
- [Vitest](https://vitest.dev/) para las pruebas de lógica

## Estructura

```text
app/            Rutas (auth, aventuras, jugador /p/[token])
components/     Componentes de interfaz y presets de estilo (estilos.ts)
lib/            Lógica compartida (normalizar, barajar, límites) y clientes de Supabase
lib/minijuegos/ Generadores y verificadores de los cinco minijuegos (solo servidor, salvo tipos, config y reglas)
supabase/       Migraciones SQL (esquema, RLS, bucket, límites)
tests/unit/     Pruebas unitarias
specs/          Especificaciones, planes y tareas (Spec Kit)
```

## Rutas

| Ruta | Acceso | Descripción |
|---|---|---|
| `/` | público | Portada |
| `/registro`, `/entrar` | público | Alta e inicio de sesión |
| `/recuperar`, `/restablecer` | público / enlace del correo | Recuperar contraseña |
| `/aventuras` | master | Lista de aventuras |
| `/aventuras/[id]` | master dueño | Editor de puzzles |
| `/aventuras/[id]/rejilla` | master dueño | Rejilla imprimible de QR |
| `/p/[token]` | público con token | Puzzle del jugador |

## Puesta en marcha

### Requisitos
- Node.js **20 o superior**
- Un proyecto de [Supabase](https://supabase.com/) (gratuito)
- Opcional para producción: cuentas de [Vercel](https://vercel.com/) y [Resend](https://resend.com/) (correo SMTP)

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Supabase
1. Crea un proyecto en Supabase.
2. En el editor SQL ejecuta, en orden, `supabase/migrations/0001_inicial.sql`, `supabase/migrations/0002_modos_en_enunciado.sql` (tablas, reglas de seguridad, bucket `imagenes` y límite de 40 imágenes por aventura), `supabase/migrations/0003_minijuego.sql` (columna del minijuego de cada puzzle) y `supabase/migrations/0004_contrasena_numerica.sql` (contraseña numérica y su longitud).
3. En *Authentication* desactiva "Confirm email" y, para recuperar contraseñas, configura el SMTP (p. ej. Resend).

### 3. Variables de entorno
Copia `.env.example` a `.env.local` y rellena:

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública (anon) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio. **Solo servidor; nunca la expongas al navegador** |

### 4. Arrancar
```bash
npm run dev      # http://localhost:3000
```

## Scripts

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm start` | Sirve la compilación |
| `npm run lint` | Linter |
| `npm test` | Pruebas unitarias (normalizar y barajar) |

## Despliegue

1. Conecta el repositorio a Vercel y añade las tres variables de entorno.
2. Despliega.
3. Añade la URL final en Supabase → Authentication → *URL de redirección* (necesario para el enlace de recuperar contraseña).

## Seguridad y límites

- Las contraseñas de los puzzles y las recompensas **no se envían** al navegador del jugador; se comprueban en una acción de servidor.
- Acceso a datos del master protegido con RLS de Supabase; una aventura ajena aparece como "no encontrada".
- De una contraseña numérica el jugador solo recibe su longitud (columna calculada `longitud_clave`), nunca el valor.
- Del minijuego solo se guarda una «receta» (tipo, nivel y semilla). El navegador recibe el tablero inicial, nunca la semilla ni la solución, y la contraseña solo se entrega cuando el servidor da por buena la solución.
- Los tokens de los puzzles son aleatorios e inmutables; no hay rutas que listen puzzles.
- Máximo **4 MB por imagen** y **40 imágenes por aventura**.

## Documentación del proyecto

El desarrollo sigue [Spec Kit](https://github.com/github/spec-kit). Consulta la carpeta [`specs/`](specs):
- [`001-qr-quest-v0`](specs/001-qr-quest-v0): especificación, plan, modelo de datos, contratos y [guía de comprobación manual](specs/001-qr-quest-v0/quickstart.md).
- [`002-mejora-visual-navegacion`](specs/002-mejora-visual-navegacion): mejora visual y de navegación.
- [`003-generador-puzzles`](specs/003-generador-puzzles): minijuegos generados automáticamente.
- Principios del proyecto: [`.specify/memory/constitution.md`](.specify/memory/constitution.md).
