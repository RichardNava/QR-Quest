import type { Config } from "tailwindcss";

// Cada color lee sus canales «R G B» de app/globals.css (así admite transparencias: bg-noche/90)
const color = (nombre: string) => `rgb(var(--color-${nombre}) / <alpha-value>)`;

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        papel: color("papel"),
        superficie: color("superficie"),
        tinta: color("tinta"),
        "tinta-suave": color("tinta-suave"),
        marca: color("marca"),
        "marca-oscura": color("marca-oscura"),
        acento: color("acento"),
        "acento-suave": color("acento-suave"),
        borde: color("borde"),
        exito: color("exito"),
        "exito-suave": color("exito-suave"),
        peligro: color("peligro"),
        "peligro-suave": color("peligro-suave"),
        noche: color("noche"),
        "noche-suave": color("noche-suave"),
      },
      fontFamily: {
        sans: ["var(--fuente)", "system-ui", "sans-serif"],
        titulo: ["var(--fuente-titulo)", "Impact", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
