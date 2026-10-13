// Presets de estilo compartidos. Solo usan colores de la paleta (app/globals.css).
const foco = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acento";

export const boton =
  `inline-flex min-h-[44px] items-center justify-center rounded-lg bg-marca px-4 py-2 font-semibold text-superficie shadow-sm hover:bg-marca-oscura disabled:opacity-50 ${foco}`;
export const botonSecundario =
  `inline-flex min-h-[44px] items-center justify-center rounded-lg border border-borde bg-superficie px-3 py-2 text-sm font-semibold text-tinta hover:bg-acento-suave disabled:opacity-50 ${foco}`;
export const botonPeligro =
  `inline-flex min-h-[44px] items-center justify-center rounded-lg border border-peligro bg-superficie px-3 py-2 text-sm font-semibold text-peligro hover:bg-peligro-suave disabled:opacity-50 ${foco}`;
export const campo =
  "min-h-[44px] w-full rounded-lg border border-borde bg-superficie px-3 py-2 text-base text-tinta focus:border-marca focus:outline-none focus:ring-2 focus:ring-acento";
export const tarjeta = "rounded-xl border border-borde bg-superficie p-5 shadow-sm";
export const enlace = "font-medium text-marca underline hover:text-marca-oscura";

// Jerarquía tipográfica
export const titulo1 = "text-3xl font-extrabold text-tinta";
export const titulo2 = "text-xl font-bold text-tinta";
export const etiqueta = "block font-semibold text-tinta";
export const apoyo = "text-sm text-tinta-suave";

// Avisos
export const aviso = "rounded-lg border border-peligro bg-peligro-suave px-3 py-2 text-sm text-peligro";
export const error = aviso;
export const avisoInfo = "rounded-lg border border-acento bg-acento-suave px-3 py-2 text-sm text-tinta";

// Espaciado de bloques
export const bloque = "space-y-6";
