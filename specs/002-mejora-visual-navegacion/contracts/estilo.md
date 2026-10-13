# Contrato de interfaz: Guía de estilo

Reglas que toda página y componente cumplen. Cubre FR-008 a FR-012 y FR-016.

## Paleta

Definida solo en `app/globals.css`. Valores y contrastes en [research.md](../research.md). Se usan siempre por su nombre (`bg-papel`, `text-tinta`, `bg-marca`…), nunca con colores sueltos.

| Papel | Token |
|---|---|
| Fondo de página | `papel` |
| Tarjetas y campos | `superficie` |
| Texto principal / secundario | `tinta` / `tinta-suave` |
| Acción principal y enlaces | `marca` (hover `marca-oscura`) |
| Detalle, sección activa, avisos | `acento` / `acento-suave` |
| Bordes y separadores | `borde` |
| Correcto | `exito` / `exito-suave` |
| Error y acciones destructivas | `peligro` / `peligro-suave` |

## Tipografía

Una sola familia (Nunito). Escala:

| Rol | Tamaño / peso | Preset |
|---|---|---|
| Título de página | 28–32 px, extrabold | `titulo1` |
| Título de sección o tarjeta | 20 px, bold | `titulo2` |
| Subtítulo / etiqueta | 16 px, semibold | `etiqueta` |
| Texto | 16 px, regular | (por defecto) |
| Texto de apoyo | 14 px, `tinta-suave` | `apoyo` |

## Espaciado

Múltiplos de 4 px (escala de Tailwind).

| Dónde | Valor |
|---|---|
| Ancho máximo del contenido | `max-w-3xl`, margen lateral 16 px |
| Entre bloques de una página | 24 px (`space-y-6`) |
| Dentro de una tarjeta | 16 px (`space-y-4`), relleno 20 px (`p-5`) |
| Entre botones | 8 px (`gap-2`) |
| Altura mínima de campos y botones | 44 px |

## Jerarquía

1. Un único título de página (`titulo1`) por pantalla.
2. Las secciones se agrupan en tarjetas con `titulo2`.
3. Un único botón principal (`boton`) por tarjeta o formulario; el resto son secundarios o de peligro.
4. Las listas de aventuras y de QR usan tarjetas con el mismo borde, radio y relleno.
5. Los avisos y errores usan el preset `aviso` con icono y texto, no solo color.

## Responsive e impresión

- Se diseña primero para 320 px y se amplía con los puntos de corte de Tailwind (`sm`, `lg`).
- Sin desplazamiento horizontal de la página en ningún ancho ≥ 320 px.
- Impresión de la rejilla: fondo blanco, QR sin cambios de tamaño ni de paginado, y todo lo que lleve `no-imprimir` oculto.

## Textos

Español de España. Los textos existentes no cambian de significado; solo se añaden los de insignias y navegación definidos en estos contratos.
