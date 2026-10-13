# Especificación de la funcionalidad: Mejora visual y navegación común

**Rama de la funcionalidad**: `002-mejora-visual-navegacion` (no se ha creado rama; no hay hook de ramas registrado)

**Creada**: 2026-10-13

**Estado**: Borrador

**Entrada**: "Mejorar la presentación de QR Quest (aplicación ya implementada en la spec 001) con dos cambios, sin alterar ninguna funcionalidad ni dato existente: navegación común visible en todas las páginas y rediseño visual profesional y llamativo, mobile-first y en español de España."

## Aclaraciones

### Sesión 2026-10-13

- Q: ¿Qué debe mostrar la navegación común en la página de un puzzle que ve el jugador (sin cuenta)? → A: Solo la marca «QR Quest» enlazada a la portada, sin más opciones.

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia 1 - Navegación común en todas las páginas (Prioridad: P1)

Cualquier persona que use la aplicación (master o jugador) ve en todas las páginas una navegación común, siempre visible, que le permite moverse entre las secciones disponibles sin usar el botón «atrás» del navegador. Las opciones mostradas se adaptan al contexto: el master con sesión iniciada ve acceso a sus aventuras y a cerrar sesión; quien no tiene sesión ve acceso a la portada y a entrar o registrarse. Dentro de una aventura, el master puede volver a su lista de aventuras o a la rejilla de QR de esa aventura sin retroceder.

**Por qué esta prioridad**: hoy el usuario depende del botón atrás para orientarse; una navegación coherente es la mejora de uso más tangible y es la base sobre la que se asienta el rediseño.

**Prueba independiente**: recorrer todas las páginas de la aplicación (portada, registro, entrada, recuperación, lista de aventuras, edición de aventura, rejilla, página de puzzle y página de «no existe») y comprobar que en cada una hay una navegación visible y que se puede llegar a cualquier sección principal desde ella sin retroceder.

**Escenarios de aceptación**:

1. **Dado** un master con sesión iniciada en cualquier página de gestión, **cuando** mira la cabecera, **entonces** ve una navegación con acceso a «Mis aventuras» y a «Cerrar sesión», y la sección actual aparece señalada.
2. **Dado** un visitante sin sesión, **cuando** abre la portada o cualquier página de acceso, **entonces** ve una navegación con acceso a la portada y a entrar o registrarse, sin opciones que requieran sesión.
3. **Dado** un master dentro de la edición o de la rejilla de una aventura, **cuando** usa la navegación, **entonces** puede pasar entre la lista de aventuras, la edición y la rejilla de esa aventura sin usar el botón atrás.
4. **Dado** un jugador en la página de un puzzle, **cuando** mira la pantalla, **entonces** la navegación muestra únicamente la marca «QR Quest» enlazada a la portada, sin otras opciones, no revela información de la aventura que no deba conocer y no interfiere con la resolución del puzzle.
5. **Dado** un móvil de pantalla pequeña, **cuando** se muestra la navegación, **entonces** todas sus opciones son alcanzables y pulsables sin desplazamiento horizontal.
6. **Dado** la impresión de la rejilla de QR, **cuando** el master la imprime, **entonces** la navegación no aparece en el papel.

---

### Historia 2 - Apariencia profesional y coherente en toda la aplicación (Prioridad: P1)

Quien use la aplicación percibe un producto cuidado, con identidad de aventura: tipografía consistente, una paleta reducida de colores cálidos que evocan aventura (tonos tierra, ocre, ámbar, terracota o similares), espaciado uniforme y una jerarquía visual clara entre títulos, subtítulos, texto, tablas y formularios. Todas las páginas comparten el mismo aspecto, de modo que se sienten parte del mismo producto.

**Por qué esta prioridad**: es el objetivo principal de la funcionalidad: pasar de una interfaz funcional a una profesional y llamativa, sin tocar el comportamiento.

**Prueba independiente**: revisar visualmente cada página en pantalla de móvil y de escritorio y verificar que usa los mismos estilos de títulos, texto, botones, formularios y tablas, y que solo aparecen colores de la paleta definida.

**Escenarios de aceptación**:

1. **Dado** cualquier página de la aplicación, **cuando** se muestra, **entonces** usa la misma familia tipográfica y una escala de tamaños coherente para títulos, subtítulos, texto y etiquetas.
2. **Dado** el conjunto de la aplicación, **cuando** se inspeccionan los colores usados, **entonces** todos proceden de una paleta limitada definida en un único lugar, de modo que cambiar un color de la paleta lo cambia en toda la aplicación.
3. **Dado** una pantalla con título, formulario y tabla o lista, **cuando** el usuario la mira, **entonces** distingue de un vistazo qué es título, qué es contenido y qué es acción principal.
4. **Dado** cualquier página, **cuando** se compara con otra, **entonces** los márgenes, separaciones y tamaños de botones y campos siguen una misma escala de espaciado.
5. **Dado** los textos sobre fondo y los controles interactivos, **cuando** se evalúa su legibilidad, **entonces** el contraste es suficiente para leerlos cómodamente, también al aire libre en un móvil.
6. **Dado** cualquier mensaje, etiqueta, botón o texto de ayuda, **cuando** se muestra, **entonces** está en español de España y no se ha modificado su significado.

---

### Historia 3 - Estados visuales distinguibles de puzzles e imágenes (Prioridad: P2)

Tanto el master como el jugador distinguen con claridad el estado de cada puzzle y de cada imagen: puzzle sin resolver, resuelto, con error de contraseña o incompleto en edición; imagen normal, difuminada o en modo rompecabezas (con sus piezas resueltas o por resolver). Los estados no dependen únicamente del color (se refuerzan con texto, iconos o formas) para que sean comprensibles por todo el mundo.

**Por qué esta prioridad**: da claridad a la experiencia de juego y de edición, pero la aplicación sigue siendo utilizable sin ella una vez completadas las historias 1 y 2.

**Prueba independiente**: con una aventura que tenga puzzles con imágenes normales, difuminadas y de rompecabezas, recorrer edición y juego y verificar que cada estado tiene un aspecto propio e identificable.

**Escenarios de aceptación**:

1. **Dado** un jugador que introduce una contraseña, **cuando** acierta o falla, **entonces** el resultado se muestra con un aspecto visual claramente diferente para acierto y para error, acompañado de un texto explicativo.
2. **Dado** una imagen difuminada o un rompecabezas sin resolver, **cuando** se muestra, **entonces** es evidente que está en ese modo y qué debe hacer el jugador, y su aspecto cambia de forma visible al resolverse.
3. **Dado** el editor de una aventura, **cuando** el master revisa sus puzzles, **entonces** distingue visualmente los puzzles completos de los que tienen campos obligatorios sin rellenar, y el modo elegido para cada imagen (normal, difuminada o rompecabezas).
4. **Dado** un estado visual cualquiera, **cuando** lo ve una persona con dificultades para distinguir colores, **entonces** sigue pudiendo identificarlo gracias a texto, iconos o formas.

---

### Casos límite

- Páginas con mucho contenido (aventura con muchos puzzles, tablas anchas): no debe aparecer desplazamiento horizontal de la página en móvil y la navegación sigue visible y usable.
- Nombres de aventura muy largos: se muestran sin romper la cabecera ni la navegación.
- Páginas de error o de «no existe» (incluida la de un puzzle borrado): también muestran la navegación y el estilo común, con el mensaje amable ya existente.
- Pantallas de escritorio y tabletas: el diseño se adapta sin deformar el contenido, aunque el diseño de partida es el móvil.
- Impresión de la rejilla de QR: debe conservar su legibilidad y su paginado actuales; los elementos decorativos y de navegación no deben consumir papel ni tinta innecesarios ni cortar ningún QR.
- Usuario con sesión caducada: la navegación pasa a mostrar las opciones de visitante tras la redirección habitual, sin cambios en el flujo existente.

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: Todas las páginas de la aplicación DEBEN mostrar una navegación común y visible que permita moverse entre las secciones disponibles sin usar el botón atrás del navegador.
- **FR-002**: La navegación DEBE adaptar sus opciones al estado del usuario: un master con sesión ve «Mis aventuras» y «Cerrar sesión»; un visitante sin sesión ve portada y acceso para entrar o registrarse.
- **FR-003**: La navegación DEBE señalar visualmente la sección en la que se encuentra el usuario.
- **FR-004**: Dentro de una aventura, la navegación DEBE permitir al master volver a la lista de aventuras y pasar entre la edición y la rejilla de QR de esa aventura.
- **FR-005**: En la página de un puzzle para el jugador, la navegación DEBE mostrar únicamente la marca «QR Quest» enlazada a la portada, sin opciones de gestión, de acceso ni información de la aventura distinta de la que ya se mostraba.
- **FR-006**: La navegación DEBE ser utilizable en pantallas de móvil sin desplazamiento horizontal y con áreas de pulsación cómodas.
- **FR-007**: La navegación DEBE quedar oculta al imprimir la rejilla de QR.
- **FR-008**: La aplicación DEBE usar como máximo dos familias tipográficas (una para títulos y otra para el texto) y una escala de tamaños coherente para títulos, subtítulos, texto y etiquetas en todas las páginas.
- **FR-009**: Los colores de la aplicación DEBEN proceder de una paleta limitada (con predominio de tonos cálidos que evoquen aventura) definida en un único lugar, de forma que modificarla se refleje en toda la aplicación.
- **FR-010**: La aplicación DEBE aplicar una escala de espaciado uniforme en márgenes, separaciones y tamaños de campos y botones.
- **FR-011**: La aplicación DEBE establecer una jerarquía visual clara y consistente entre títulos, tablas o listas, formularios y acciones principales y secundarias.
- **FR-012**: Los textos y controles DEBEN mantener un contraste suficiente para su lectura cómoda en un móvil, incluido el uso al aire libre.
- **FR-013**: Los estados de puzzle (sin resolver, resuelto, error de contraseña, incompleto en edición) DEBEN ser visualmente distinguibles entre sí.
- **FR-014**: Los estados de imagen (normal, difuminada, rompecabezas sin resolver, rompecabezas resuelto) DEBEN ser visualmente distinguibles entre sí.
- **FR-015**: Ningún estado visual DEBE depender únicamente del color: cada uno DEBE reforzarse con texto, icono o forma.
- **FR-016**: La aplicación DEBE mantener el enfoque mobile-first y adaptarse correctamente a tabletas y pantallas de escritorio.
- **FR-017**: Todos los textos visibles DEBEN estar en español de España; los textos existentes NO DEBEN cambiar de significado.
- **FR-018**: La funcionalidad DEBE ser exclusivamente visual: NO DEBE alterar el comportamiento, las reglas de negocio, los datos almacenados, las rutas existentes ni la estructura del proyecto definidos en la spec 001.
- **FR-020**: La aplicación DEBE tener una identidad visual de aventura reconocible: fondos con degradado y textura decorativa (por ejemplo, curvas de nivel de un mapa) y un bloque de portada destacado con ilustración, sin imágenes pesadas y sin aparecer al imprimir.
- **FR-019**: La rejilla de QR impresa DEBE conservar su legibilidad, su tamaño de QR y su paginado actuales.

### Entidades clave

No se introducen ni modifican entidades de datos. Los conceptos visuales que esta funcionalidad define son:

- **Paleta de colores**: conjunto reducido y con nombre de colores de la marca, definido en un único lugar y reutilizado por toda la aplicación.
- **Navegación común**: barra visible en todas las páginas cuyas opciones dependen del estado del usuario (visitante, master, jugador) y de la sección actual.
- **Estado visual**: aspecto propio de un puzzle o de una imagen según su situación (sin resolver, resuelto, error, incompleto; normal, difuminada, rompecabezas).

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: El 100 % de las páginas de la aplicación muestran la navegación común, y desde cualquiera de ellas se alcanza cualquier sección principal con un máximo de 2 pulsaciones y sin usar el botón atrás.
- **SC-002**: Un master que ya conoce la aplicación completa la tarea de ir de la lista de aventuras a la rejilla de QR de una aventura y volver, sin usar el botón atrás, en menos de 15 segundos.
- **SC-003**: El 100 % de los colores visibles de la aplicación pertenecen a la paleta definida, y cambiar un color de la paleta se refleja en todas las páginas sin más ajustes.
- **SC-004**: Al menos 9 de cada 10 personas a las que se muestra la aplicación valoran su aspecto como «profesional» o «cuidado» en una breve encuesta de impresión.
- **SC-005**: En una prueba con personas que no han visto antes la aplicación, al menos 9 de cada 10 identifican correctamente el estado (resuelto, error, sin resolver) de un puzzle y el modo (normal, difuminada, rompecabezas) de una imagen sin ayuda.
- **SC-006**: No aparece desplazamiento horizontal en ninguna página en pantallas de 320 px de ancho o más.
- **SC-007**: Todas las pruebas de comportamiento y flujos de la spec 001 siguen pasando sin modificar sus resultados esperados tras el cambio visual.
- **SC-008**: La rejilla de QR impresa mantiene el mismo número de páginas y de QR por página que antes del cambio, y todos los QR siguen siendo escaneables.

## Supuestos

- La funcionalidad se aplica sobre la aplicación ya implementada en la spec 001 y no cambia sus rutas, datos, reglas ni estructura.
- Las opciones de la navegación se limitan a las secciones que ya existen (portada, entrar, registro, mis aventuras, aventura, rejilla, cerrar sesión); no se crean secciones nuevas.
- La recuperación y el restablecimiento de contraseña se alcanzan desde la página de entrada, como hasta ahora, y no necesitan entrada propia en la navegación.
- La paleta se orienta a tonos cálidos de aventura (tierra, ocre, ámbar, terracota, con un neutro claro y uno oscuro); la elección exacta de los valores corresponde al diseño.
- Se utilizará una fuente que cargue con rapidez y funcione bien con los caracteres del español; no se incluye modo oscuro en esta versión.
- No se añaden animaciones esenciales para el uso; cualquier efecto decorativo es opcional y no debe penalizar el rendimiento en móviles modestos.
- Las imágenes e iconos decorativos que se incorporen no alteran los límites de tamaño ni de número de imágenes definidos en la spec 001.
