# Especificación de la funcionalidad: Generador automático de puzzles

**Rama de la funcionalidad**: `003-generador-puzzles` (no se ha creado rama; no hay hook de ramas registrado)

**Creada**: 2026-10-14

**Estado**: Borrador

**Entrada**: "Además de los botones para añadir texto e imágenes, añadir botones que generen automáticamente puzzles (Rush Hour, Lights Out, Mastermind, Sudoku y Laberinto) sin recurrir a una IA cada vez. Es clave que al resolverlos se obtenga la contraseña/código necesarios para resolver el puzzle."

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia 1 - El master añade un minijuego generado a un puzzle (Prioridad: P1)

Al editar un puzzle, además de los botones para añadir texto e imágenes, el master dispone de una opción «Añadir minijuego» que le deja elegir uno de cinco tipos: Rush Hour, Lights Out, Mastermind, Sudoku o Laberinto. Elige el tipo y (si procede) una dificultad, y la aplicación genera al instante un minijuego válido y con solución, sin que el master tenga que diseñarlo. El master puede ver una vista previa, pedir otro distinto con «Generar de nuevo» o quitarlo. El minijuego pasa a formar parte del contenido del puzzle junto a los textos e imágenes.

**Por qué esta prioridad**: es el núcleo de la funcionalidad; sin poder añadir un minijuego generado no existe nada más.

**Prueba independiente**: crear un puzzle, pulsar «Añadir minijuego», elegir un tipo, comprobar que aparece un minijuego jugable, regenerarlo y guardarlo.

**Escenarios de aceptación**:

1. **Dado** un master editando un puzzle, **cuando** mira la zona de contenido, **entonces** ve la opción «Añadir minijuego» junto a las de añadir texto e imagen.
2. **Dado** que elige un tipo y una dificultad, **cuando** confirma, **entonces** se genera un minijuego de ese tipo en menos de 2 segundos y se muestra como vista previa.
3. **Dado** un minijuego ya generado, **cuando** pulsa «Generar de nuevo», **entonces** obtiene un minijuego distinto del mismo tipo y dificultad.
4. **Dado** un minijuego añadido, **cuando** el master lo quita, **entonces** el puzzle vuelve a funcionar solo con su contraseña normal.
5. **Dado** un puzzle con minijuego, **cuando** el master guarda y vuelve a editar, **entonces** el minijuego conserva exactamente el mismo tablero que se guardó.

---

### Historia 2 - El jugador resuelve el minijuego y obtiene la contraseña (Prioridad: P1)

Un jugador escanea el QR de un puzzle que contiene un minijuego. Lee los textos e imágenes y juega al minijuego. Al resolverlo, la aplicación le muestra la contraseña o código del puzzle, que puede escribir en el campo habitual para ver la recompensa. Mientras no lo resuelva, la contraseña no se muestra por ningún medio de la aplicación.

**Por qué esta prioridad**: es lo que da sentido al minijuego (el propio enunciado lo marca como clave): el reto es el camino para conseguir la contraseña.

**Prueba independiente**: abrir el puzzle como jugador, resolver el minijuego de cada tipo, comprobar que aparece la contraseña, introducirla y ver la recompensa.

**Escenarios de aceptación**:

1. **Dado** un jugador con un minijuego sin resolver, **cuando** observa la página, **entonces** no aparece la contraseña ni nada que la revele sin haber resuelto el reto.
2. **Dado** que resuelve correctamente el minijuego, **cuando** termina, **entonces** ve un mensaje de éxito y la contraseña del puzzle bien visible, con indicación de dónde escribirla.
3. **Dado** que ha obtenido la contraseña, **cuando** la escribe en el campo de contraseña, **entonces** se muestra la recompensa como en cualquier otro puzzle.
4. **Dado** un puzzle con minijuego, **cuando** el jugador ya conoce la contraseña por otra vía y la escribe sin jugar, **entonces** también se muestra la recompensa (el minijuego es el camino, no un requisito adicional).
5. **Dado** un jugador que recarga la página, **cuando** vuelve, **entonces** el minijuego se muestra con el mismo tablero inicial y vuelve a estar sin resolver (no se guarda progreso).
6. **Dado** un móvil, **cuando** se juega a cualquiera de los cinco, **entonces** se puede completar con el dedo sin desplazamiento horizontal de la página.

---

### Historia 3 - Cada tipo de minijuego es variado, resoluble y de dificultad ajustable (Prioridad: P2)

Cada tipo ofrece al menos tres niveles de dificultad (fácil, medio, difícil). Todo minijuego generado tiene solución garantizada; en los que la solución debe ser única (Sudoku), lo es. Dos generaciones consecutivas del mismo tipo y nivel dan tableros distintos.

**Por qué esta prioridad**: asegura calidad y rejugabilidad; con un único nivel por tipo ya sería utilizable una vez cumplidas las historias 1 y 2.

**Prueba independiente**: generar muchos minijuegos de cada tipo y nivel y comprobar que todos son resolubles y que la dificultad percibida crece de fácil a difícil.

**Escenarios de aceptación**:

1. **Dado** cualquier tipo y nivel, **cuando** se genera un minijuego, **entonces** es resoluble.
2. **Dado** un Sudoku generado, **cuando** se comprueba, **entonces** tiene una única solución.
3. **Dado** un Rush Hour generado, **cuando** se juega, **entonces** hay que mover bloques deslizantes (horizontales y verticales) para sacar la pieza marcada por la salida, y el número mínimo de movimientos crece con la dificultad.
4. **Dado** un Lights Out generado, **cuando** se pulsa una casilla, **entonces** cambia ella y sus vecinas ortogonales, y el objetivo es apagarlas todas.
5. **Dado** un Mastermind generado, **cuando** el jugador propone una combinación, **entonces** recibe pistas de aciertos en posición y en color, con un número limitado de intentos suficiente para resolverlo.
6. **Dado** un Laberinto generado, **cuando** el jugador mueve la ficha, **entonces** no puede atravesar paredes y gana al llegar a la meta; el tamaño crece con la dificultad.
7. **Dado** dos generaciones seguidas del mismo tipo y nivel, **cuando** se comparan, **entonces** los tableros son distintos.

---

### Casos límite

- Un puzzle con minijuego pero sin contraseña definida: el master no puede guardarlo y se le indica que la contraseña es necesaria, porque el minijuego debe revelar algo.
- El master cambia la contraseña de un puzzle que ya tiene minijuego: al resolverlo, el jugador ve la contraseña nueva.
- Un jugador que se queda atascado: puede reiniciar el tablero a su estado inicial cuando quiera; no hay límite de tiempo.
- Mastermind agota sus intentos: se informa del fallo y se ofrece reintentar con el mismo tablero.
- Un puzzle con más de un minijuego: no se permite; cada puzzle admite como máximo uno.
- Impresión de la rejilla de QR: no se ve afectada, porque el minijuego solo aparece en la página del puzzle.
- Las contraseñas con espacios, tildes o mayúsculas se muestran tal como las definió el master.

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **RF-001**: El editor de puzzles DEBE ofrecer una opción «Añadir minijuego» junto a las de añadir texto e imagen, que permita elegir entre Rush Hour, Lights Out, Mastermind, Sudoku y Laberinto.
- **RF-002**: El sistema DEBE generar cada minijuego automáticamente mediante un algoritmo propio, sin consultar a una IA ni a ningún servicio externo, y sin coste por generación.
- **RF-003**: El master DEBE poder elegir entre al menos tres niveles de dificultad, ver una vista previa jugable, regenerar el minijuego y quitarlo.
- **RF-004**: Todo minijuego generado DEBE tener solución garantizada y el Sudoku DEBE tener solución única.
- **RF-005**: Cada puzzle DEBE admitir como máximo un minijuego, que forma parte de su contenido junto a textos e imágenes.
- **RF-006**: El minijuego guardado DEBE conservar el mismo tablero hasta que el master lo regenere o lo quite.
- **RF-007**: Al resolver el minijuego, el sistema DEBE mostrar al jugador la contraseña del puzzle con un mensaje claro de éxito.
- **RF-008**: Mientras el minijuego no esté resuelto, la contraseña NO DEBE ser accesible al jugador por ningún medio de la aplicación (ni visible ni obtenible inspeccionando la página). La resolución se comprueba de forma que no basta con afirmar que se ha resuelto.
- **RF-009**: La contraseña mostrada al resolver DEBE ser la contraseña vigente del puzzle definida por el master, y la recompensa se desbloquea con ella igual que en cualquier puzzle (comparación según RF-012 de la spec 001).
- **RF-010**: Un puzzle con minijuego DEBE seguir pudiendo desbloquearse escribiendo directamente la contraseña, sin jugar.
- **RF-011**: El master NO DEBE poder guardar un puzzle con minijuego si no tiene contraseña definida.
- **RF-012**: El jugador DEBE poder reiniciar el minijuego a su estado inicial en cualquier momento; el sistema NO DEBE guardar su progreso, tiempos ni resultados.
- **RF-013**: Los cinco minijuegos DEBEN poder jugarse con el dedo en móvil y con ratón en ordenador, y verse sin desborde horizontal desde 320 px de ancho.
- **RF-014**: Los estados del minijuego (sin resolver, resuelto, intento fallido) DEBEN distinguirse mediante texto además del color.
- **RF-015**: Todos los textos, instrucciones de juego y mensajes DEBEN estar en español de España, e incluir una breve explicación de las reglas de cada tipo.
- **RF-016**: Esta funcionalidad NO DEBE alterar los puzzles, QR, imágenes ni recompensas existentes, que siguen funcionando igual.

### Entidades clave

- **Minijuego**: contenido opcional de un puzzle. Tiene un tipo (Rush Hour, Lights Out, Mastermind, Sudoku o Laberinto), un nivel de dificultad y un tablero inicial generado con solución garantizada. Pertenece a un solo puzzle.
- **Puzzle** (ampliado): admite, además de textos e imágenes, un minijuego; su contraseña es la que revela el minijuego al resolverse.

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **CE-001**: Un master añade un minijuego a un puzzle en menos de 30 segundos y 4 pulsaciones desde que abre el editor.
- **CE-002**: El 100 % de los minijuegos generados (comprobados en al menos 100 generaciones por tipo y nivel) son resolubles, y el 100 % de los Sudokus tienen solución única.
- **CE-003**: La generación de un minijuego tarda menos de 2 segundos en un móvil estándar.
- **CE-004**: Un jugador que resuelve un minijuego de nivel fácil lo hace en menos de 3 minutos y ve la contraseña inmediatamente después.
- **CE-005**: En el 100 % de los casos sin resolver el minijuego no hay forma de ver la contraseña en la aplicación.
- **CE-006**: Los cinco tipos se completan con éxito desde un móvil de 320 px de ancho y desde un ordenador, sin elementos cortados.
- **CE-007**: Una persona sin conocimientos técnicos entiende las reglas de cada minijuego con la explicación mostrada, sin ayuda externa.
- **CE-008**: El coste de funcionamiento de la generación es cero.
- **CE-009**: El 100 % de los puzzles creados antes de esta funcionalidad siguen funcionando sin cambios.

## Supuestos

- La contraseña del puzzle sigue definiéndola el master como en la spec 001; el minijuego se limita a revelarla al resolverse, en lugar de generar una propia.
- Los cinco tipos se ofrecen siempre; no hay selección de tipos activables por aventura.
- Los niveles de dificultad son fácil, medio y difícil, y cada tipo los interpreta a su manera (tamaño, número de bloques, longitud del código, casillas vacías...).
- No se guarda el progreso del jugador (coherente con RF-013 de la spec 001); recargar equivale a reiniciar.
- Los textos e imágenes del puzzle se muestran junto al minijuego y pueden contener pistas que ayuden a jugarlo; su uso es decisión del master.
- Los minijuegos se consideran parte del contenido del puzzle y no de la recompensa.
- Fuera de alcance en esta versión: más tipos de minijuego, editar manualmente el tablero, y que el minijuego genere por sí mismo contraseñas distintas a la del puzzle.
