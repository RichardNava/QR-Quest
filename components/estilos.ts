// Presets de estilo compartidos. Solo usan colores de la paleta (app/globals.css).
const foco = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acento focus-visible:ring-offset-2 focus-visible:ring-offset-papel";
const base = "inline-flex min-h-[44px] items-center justify-center rounded-lg font-titulo font-bold uppercase tracking-wider transition disabled:opacity-50";

export const boton =
  `${base} bg-gradient-to-b from-marca to-marca-oscura px-5 py-2 text-lg text-superficie shadow-lg shadow-marca/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-marca/40 ${foco}`;
export const botonSecundario =
  `${base} border-2 border-noche bg-transparent px-3 py-2 text-base text-noche hover:bg-noche hover:text-superficie ${foco}`;
export const botonPeligro =
  `${base} border-2 border-peligro bg-transparent px-3 py-2 text-base text-peligro hover:bg-peligro hover:text-superficie ${foco}`;
// Barra «Añadir …» de los editores: todos los botones comparten altura y no parten el texto
export const botonAnadir =
  `${base} flex-1 whitespace-nowrap border-2 border-dashed border-noche/50 bg-transparent px-3 py-2 text-base text-noche hover:border-solid hover:bg-noche hover:text-superficie ${foco}`;
export const campo =
  "min-h-[44px] w-full rounded-lg border-2 font-normal normal-case tracking-normal border-borde bg-superficie px-3 py-2 text-base text-tinta shadow-inner placeholder:text-tinta-suave/70 focus:border-marca focus:outline-none focus:ring-2 focus:ring-acento";
export const tarjeta =
  "rounded-2xl border border-borde border-t-4 border-t-acento bg-superficie/95 p-5 shadow-xl shadow-noche/10 backdrop-blur-sm";
export const enlace = "font-semibold text-marca underline decoration-acento decoration-2 underline-offset-4 hover:text-marca-oscura";

// Jerarquía tipográfica: títulos condensados en mayúsculas; texto en sans-serif
export const titulo1 = "font-titulo text-4xl font-extrabold uppercase leading-none tracking-wide text-noche sm:text-5xl";
export const titulo2 = "font-titulo text-2xl font-bold uppercase tracking-wide text-noche";
export const etiqueta = "block text-sm font-semibold uppercase tracking-wider text-tinta-suave";
export const apoyo = "text-sm text-tinta-suave";

// Avisos
export const aviso = "rounded-lg border border-peligro bg-peligro-suave px-3 py-2 text-sm font-medium text-peligro";
export const error = aviso;
export const avisoInfo = "rounded-lg border border-acento bg-acento-suave px-3 py-2 text-sm text-tinta";

// Espaciado de bloques
export const bloque = "space-y-6";
