# Especificación de la funcionalidad: QR Quest v0

**Rama de la funcionalidad**: `001-qr-quest-v0` (no se ha creado rama; no hay hook de ramas registrado)

**Creada**: 2026-10-12

**Estado**: Borrador

**Entrada**: Especificación inicial "QR Quest v0" aportada por el usuario, aclarada mediante dos rondas de preguntas.

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia 1 - El master crea una aventura (Prioridad: P1)

Un usuario master con cuenta crea una aventura nueva (por ejemplo, una búsqueda del tesoro por su barrio para el cumpleaños de sus hijos). Define una cadena lineal de puzzles: cada puzzle tiene textos e imágenes, una contraseña o código que lo resuelve y una recompensa (una imagen o descripción con la pista hacia el siguiente puzzle). El último puzzle muestra un mensaje de final de aventura en lugar de otra pista.

**Por qué esta prioridad**: sin aventuras creadas no existe producto. Es el núcleo del valor para el master.

**Prueba independiente**: se puede probar entrando como master, creando una aventura con 3 puzzles y comprobando que queda guardada y que se puede reabrir.

**Escenarios de aceptación**:

1. **Dado** un master con sesión iniciada, **cuando** crea una aventura con varios puzzles (texto, imágenes, contraseña y recompensa), **entonces** la aventura queda guardada y aparece en su lista de aventuras.
2. **Dado** un master con aventuras guardadas, **cuando** edita o elimina una aventura, **entonces** los cambios se reflejan al volver a abrirla y una aventura eliminada deja de ser accesible, incluidos sus QR.
3. **Dado** un master que añade imágenes, **cuando** supera el tamaño máximo por imagen o el número máximo de imágenes por aventura, **entonces** el sistema lo rechaza con un mensaje claro que explica el límite.

---

### Historia 2 - El master imprime la rejilla de QR (Prioridad: P1)

El master puede imprimir la rejilla de QR que enlazan a los puzzles, cada uno claramente identificado, para recortarlos y colocarlos por el barrio, la casa rural, el salón del evento, etc.

**Por qué esta prioridad**: el QR es el vínculo entre el mundo físico y la aventura; sin rejilla imprimible el juego no se puede desplegar.

**Prueba independiente**: con una aventura creada, generar la rejilla, imprimirla (o vista previa de impresión) y escanear cada QR con un móvil.

**Escenarios de aceptación**:

1. **Dado** una aventura con N puzzles, **cuando** el master genera la rejilla, **entonces** se muestra una rejilla con N códigos QR, cada uno con una etiqueta identificativa.
2. **Dado** la rejilla generada, **cuando** el master la imprime, **entonces** la rejilla cabe en páginas impresas sin cortar ningún QR y los QR son legibles.
3. **Dado** un QR impreso, **cuando** un jugador lo escanea, **entonces** se abre la página del puzzle correspondiente dentro de la propia web.

---

### Historia 3 - El jugador resuelve un puzzle y obtiene la recompensa (Prioridad: P1)

Un jugador, sin cuenta ni inicio de sesión, escanea un QR con su móvil, ve el puzzle (textos e imágenes) e introduce la contraseña o código. Si acierta, obtiene la recompensa con la pista hacia el siguiente QR; si es el último puzzle, ve el mensaje de final.

**Por qué esta prioridad**: es la experiencia de juego, la razón de ser del producto.

**Prueba independiente**: escanear un QR, introducir un código erróneo y después el correcto.

**Escenarios de aceptación**:

1. **Dado** la página de un puzzle, **cuando** el jugador introduce la contraseña correcta (sin distinguir mayúsculas, minúsculas ni tildes), **entonces** se muestra la recompensa.
2. **Dado** la página de un puzzle, **cuando** introduce una contraseña incorrecta, **entonces** ve un mensaje amable de error, puede volver a intentarlo sin límite de intentos y la recompensa no se revela.
3. **Dado** un jugador sin haber escaneado el QR, **cuando** intenta acceder a una página de puzzle sin pasar por el enlace de su QR (por ejemplo, adivinando direcciones), **entonces** no puede acceder.
4. **Dado** el último puzzle de la aventura, **cuando** el jugador lo resuelve, **entonces** ve el mensaje de final de aventura.

---

### Historia 4 - Recompensas con difuminado o rompecabezas (Prioridad: P2)

El master puede configurar que la imagen de la recompensa se presente como un reto adicional: **difuminada** (el jugador debe reconocerla o revelarla) o como **rompecabezas** (la imagen se fragmenta en trozos que el jugador recompone arrastrando y soltando). Al completarlo ve la pista.

**Por qué esta prioridad**: aporta variedad y vistosidad al juego, pero una recompensa simple ya hace funcional el MVP.

**Prueba independiente**: configurar una recompensa con difuminado y otra con rompecabezas y jugarlas desde un móvil.

**Escenarios de aceptación**:

1. **Dado** una recompensa configurada como difuminado, **cuando** el jugador acierta la contraseña, **entonces** ve la imagen difuminada y puede revelarla de forma clara y comprensible.
2. **Dado** una recompensa configurada como rompecabezas, **cuando** el jugador acierta la contraseña, **entonces** ve la imagen fragmentada, puede mover los trozos arrastrándolos y al colocarlos todos bien se muestra la imagen completa y la pista.
3. **Dado** un dispositivo táctil o un ordenador, **cuando** el jugador arrastra los trozos, **entonces** el rompecabezas funciona en ambos.

---

### Historia 5 - Registro e inicio de sesión del master (Prioridad: P1)

El master se registra con el mínimo de datos posible (correo electrónico y contraseña) y puede iniciar y cerrar sesión. Solo el master necesita cuenta; los jugadores nunca.

**Por qué esta prioridad**: es imprescindible para identificar a quién pertenece cada aventura.

**Prueba independiente**: registrarse, cerrar sesión, volver a entrar y ver las aventuras propias.

**Escenarios de aceptación**:

1. **Dado** una persona sin cuenta, **cuando** se registra con correo y contraseña, **entonces** tiene acceso a su espacio de master sin que se le pidan más datos.
2. **Dado** un master, **cuando** intenta ver o editar aventuras de otro master, **entonces** el sistema lo impide.

---

### Casos límite

- Imagen que supera 4 MB o aventura que supera 40 imágenes: se informa del límite y no se guarda.
- Archivo subido que no es una imagen válida: se rechaza con un mensaje claro.
- Una aventura sin puzzles o con un puzzle sin contraseña: no se puede generar la rejilla hasta completarla.
- Aventura eliminada mientras un QR sigue impreso: al escanearlo se muestra un mensaje amable de que la aventura ya no existe.
- Jugador que cambia de dispositivo o recarga la página: el puzzle vuelve a mostrarse desde el principio porque no se guarda progreso.
- Puzzle de rompecabezas con una imagen muy pequeña o de proporciones extremas: el rompecabezas sigue siendo jugable.
- Rejilla con muchos QR (por ejemplo, decenas de puzzles): se reparte en varias páginas impresas.

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **RF-001**: El sistema DEBE permitir a un usuario registrarse e iniciar sesión como master solo con correo electrónico y contraseña, sin solicitar ningún otro dato personal.
- **RF-002**: El sistema DEBE permitir a un master crear varias aventuras y editarlas y eliminarlas, y solo él puede gestionar las suyas.
- **RF-003**: Cada aventura DEBE ser una cadena lineal de puzzles; cada puzzle tiene textos, imágenes opcionales, una contraseña o código y una recompensa.
- **RF-004**: La recompensa DEBE poder ser una imagen o una descripción con la pista hacia el siguiente puzzle; la del último puzzle es el mensaje de final.
- **RF-005**: El sistema DEBE permitir que la imagen de la recompensa se presente en modo normal, difuminado o rompecabezas, a elección del master.
- **RF-006**: En el modo difuminado, la imagen DEBE mostrarse con un difuminado que dificulte reconocerla y el jugador DEBE poder revelarla.
- **RF-007**: En el modo rompecabezas, la imagen DEBE fragmentarse en trozos que el jugador recompone arrastrando y soltando.
- **RF-008**: El sistema DEBE generar para cada aventura una rejilla con un código QR por puzzle, con etiqueta identificativa, y DEBE poder imprimirse sin cortar ni deformar los QR.
- **RF-009**: Cada QR DEBE enlazar con la página del puzzle correspondiente dentro de la propia web.
- **RF-010**: Las páginas de los puzzles DEBEN ser accesibles únicamente desde el enlace del QR; el identificador del enlace no puede ser adivinable ni deducible, de modo que los jugadores no puedan saltarse pasos ni acceder a otras páginas.
- **RF-011**: Los jugadores DEBEN poder jugar sin cuenta ni inicio de sesión.
- **RF-012**: La recompensa DEBE mostrarse solo si el jugador introduce la contraseña correcta; la comparación no distingue mayúsculas, minúsculas ni tildes. No hay límite de intentos y los fallos muestran un mensaje amable.
- **RF-013**: El sistema NO DEBE guardar progreso, tiempos ni resultados de los jugadores.
- **RF-014**: El sistema DEBE conservar de forma persistente las aventuras, puzzles, QR e imágenes.
- **RF-015**: El sistema DEBE limitar el tamaño de cada imagen a 4 MB y a 40 imágenes por aventura, e informar claramente al master si se supera.
- **RF-016**: Toda la aplicación (zona de master y de jugador) DEBE verse y usarse correctamente en móvil, tableta y ordenador.
- **RF-017**: La interfaz DEBE ser visualmente atractiva y amable, y los flujos principales ágiles e intuitivos.
- **RF-018**: Toda la interfaz y los mensajes DEBEN estar en español de España.

### Entidades clave

- **Master**: persona que crea aventuras. Datos: correo electrónico y contraseña.
- **Aventura**: conjunto ordenado de puzzles propiedad de un master, con nombre.
- **Puzzle**: página de juego con textos, imágenes, contraseña, posición en la cadena y recompensa. Tiene su QR asociado.
- **Recompensa**: imagen o descripción con la pista siguiente, con modo de presentación (normal, difuminado, rompecabezas); en el último puzzle es el mensaje de final.
- **Imagen**: archivo adjunto a un puzzle o recompensa, sujeto a los límites de tamaño y cantidad.
- **Rejilla de QR**: vista imprimible de todos los QR de una aventura.

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **CE-001**: Un master nuevo puede registrarse y crear una aventura de 5 puzzles con la rejilla lista para imprimir en menos de 20 minutos sin ayuda.
- **CE-002**: El 100 % de los QR de una rejilla impresa se escanean con un móvil estándar y abren el puzzle correcto.
- **CE-003**: Un jugador pasa de escanear el QR a ver la recompensa en menos de 1 minuto si conoce la contraseña.
- **CE-004**: La recompensa no se muestra en ninguno de los intentos con contraseña incorrecta, y se muestra en el 100 % de los intentos con la correcta.
- **CE-005**: Los modos difuminado y rompecabezas pueden completarse con éxito desde un móvil y un ordenador.
- **CE-006**: Todas las pantallas se ven sin desbordes ni elementos cortados en un móvil (320 px de ancho), una tableta y un ordenador.
- **CE-007**: Intentar abrir una página de puzzle sin el enlace de su QR (por ejemplo, adivinando direcciones) falla en el 100 % de los casos.
- **CE-008**: Al superar los límites de imágenes, el master recibe un mensaje que indica claramente el límite en el 100 % de los casos.
- **CE-009**: El coste de funcionamiento del servicio es cero.

## Supuestos

- Los jugadores usan un móvil con cámara y conexión a internet durante el juego.
- La recuperación de contraseña por correo queda dentro de lo mínimo imprescindible para el master; no se añaden otras funciones de cuenta.
- Cada puzzle tiene una única contraseña correcta.
- La rejilla se imprime desde el navegador (vista imprimible).
- Una aventura puede tener cualquier número de puzzles dentro de los límites de imágenes; no se fija un máximo propio.
- El lanzamiento en producción con servicios gratuitos es una restricción de coste, no un requisito de esta funcionalidad.
- Fuera de alcance: generación de aventuras con IA, ranking, tiempos, guardado de progreso de jugadores, aventuras ramificadas o de orden libre, idiomas distintos del español de España.
