import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        papel: "var(--color-papel)",
        superficie: "var(--color-superficie)",
        tinta: "var(--color-tinta)",
        "tinta-suave": "var(--color-tinta-suave)",
        marca: "var(--color-marca)",
        "marca-oscura": "var(--color-marca-oscura)",
        acento: "var(--color-acento)",
        "acento-suave": "var(--color-acento-suave)",
        borde: "var(--color-borde)",
        exito: "var(--color-exito)",
        "exito-suave": "var(--color-exito-suave)",
        peligro: "var(--color-peligro)",
        "peligro-suave": "var(--color-peligro-suave)",
      },
      fontFamily: {
        sans: ["var(--fuente)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
