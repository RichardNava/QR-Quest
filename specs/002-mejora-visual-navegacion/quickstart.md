# Guía de comprobación: Mejora visual y navegación común

Pensada para que cualquier persona la siga con la aplicación delante, sin leer código (constitución, principio IV).

## Preparación

1. Tener el entorno de la spec 001 funcionando (ver [su quickstart](../001-qr-quest-v0/quickstart.md)): `npm install` y `npm run dev`, con la aplicación en `http://localhost:3000`.
2. Tener una cuenta de master con una aventura de 3 puzzles que incluya una imagen **normal**, una **difuminada** y un **rompecabezas**. Si no la hay, crearla antes de empezar.
3. Abrir la aplicación en el móvil o, en el ordenador, con las herramientas del navegador a **320 px** de ancho.

## Pruebas automáticas

```bash
npm test
```

**Esperado**: todo en verde, incluidas las pruebas de la spec 001 (SC-007) y la de coherencia de estilos (SC-003).

## A. Navegación (FR-001 a FR-007, SC-001, SC-002)

| Paso | Qué hacer | Resultado esperado |
|---|---|---|
| A1 | Sin sesión, abrir la portada | Barra con «Entrar» y «Crear cuenta» |
| A2 | Pulsar «Entrar», luego «¿Has olvidado…?» (recuperar) | La barra sigue visible en ambas; se vuelve a la portada pulsando la marca |
| A3 | Entrar como master | Barra con «Mis aventuras» y «Cerrar sesión»; «Mis aventuras» aparece señalada en `/aventuras` |
| A4 | Abrir una aventura | Aparece la segunda fila «Editar · Rejilla» con «Editar» señalada |
| A5 | Pulsar «Rejilla» y luego «Mis aventuras» | Se navega sin usar el botón atrás; en total ≤ 2 pulsaciones por cambio |
| A6 | Pulsar «Cerrar sesión» | Se cierra sesión y se vuelve a la portada, como antes |
| A7 | Abrir la dirección de un puzzle (`/p/…`) | Solo se ve la marca «QR Quest»; al pulsarla se va a la portada |
| A8 | Abrir un puzzle inexistente (`/p/xxxx`) y una dirección inventada (`/xyz`) | Ambos muestran su mensaje amable y la barra |
| A9 | Vista previa de impresión de la rejilla | La barra no aparece |

## B. Aspecto general (FR-008 a FR-012, FR-016, SC-004, SC-006)

| Paso | Qué hacer | Resultado esperado |
|---|---|---|
| B1 | Recorrer todas las páginas | Misma tipografía, mismos colores cálidos, mismo estilo de botones y campos |
| B2 | Mirar una pantalla con título, formulario y lista | Se distingue de un vistazo título, contenido y botón principal |
| B3 | Redimensionar entre 320 px, 768 px y 1280 px | Sin desplazamiento horizontal y sin deformaciones |
| B4 | Poner un nombre de aventura de 80 caracteres | La barra y la tarjeta no se rompen |
| B5 | Cambiar un color en `app/globals.css` (p. ej. `--color-marca`) y recargar | Cambia en toda la aplicación; después deshacer el cambio |
| B6 | Pedir a 3 personas que valoren el aspecto (profesional / cuidado) | Al menos 9 de cada 10 lo valoran positivamente (en conjunto) |

## C. Estados (FR-013 a FR-015, SC-005)

| Paso | Qué hacer | Resultado esperado |
|---|---|---|
| C1 | Editor: dejar la contraseña de un puzzle vacía | Insignia «Incompleto» ⚠ y borde de acento; al rellenarla pasa a «Completo» ✓ |
| C2 | Editor: ver las imágenes | Cada una muestra «Normal», «Difuminada» o «Rompecabezas» |
| C3 | Jugador: contraseña incorrecta | Aviso rojo con ✕ y texto |
| C4 | Jugador: contraseña correcta | Cabecera verde con ✓ «¡Correcto!» (o «¡Fin de la aventura!») |
| C5 | Jugador: imagen difuminada | Se ve «Difuminada · pulsa para revelar»; al revelarla desaparece el aviso |
| C6 | Jugador: rompecabezas | «Rompecabezas · por resolver»; al completarlo, «Recompuesto» ✓ |
| C7 | Activar un filtro de escala de grises en el navegador | Todos los estados siguen siendo identificables por icono y texto |

## D. Sin regresiones (FR-018, FR-019, SC-007, SC-008)

1. Repetir el flujo completo de la spec 001 (crear aventura, imprimir rejilla, resolver puzzles hasta el final): todo funciona como antes.
2. Comparar la impresión de la rejilla con la anterior: mismo número de páginas y de QR por página, y todos los QR se escanean.
3. Confirmar que no hay cambios en `lib/`, `supabase/`, `middleware.ts` ni `actions.ts` (`git diff --stat`).
