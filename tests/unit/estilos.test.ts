import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const raiz = join(__dirname, "..", "..");

function ficheros(dir: string): string[] {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) return ficheros(ruta);
    return /\.(ts|tsx)$/.test(nombre) ? [ruta] : [];
  });
}

// Colores de la paleta por defecto de Tailwind, valores hex y funciones de color sueltas
const prohibidos = [
  /\b(bg|text|border|ring|from|to|via|divide|outline|fill|stroke|decoration|shadow|accent|caret)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g,
  /#[0-9a-fA-F]{3,8}\b/g,
  // Se permite rgb(var(--color-…)): es una referencia a la paleta, no un color nuevo
  /\b(rgb|rgba|hsl|hsla)\((?!var\(--color-)/g,
];

// Excepción: las tarjetas de QR se imprimen en blanco puro para que el código se escanee bien
const permitidos: Record<string, RegExp[]> = {
  "components/RejillaQR.tsx": [/\bbg-white\b/],
};

describe("estilos: solo colores de la paleta", () => {
  const archivos = [...ficheros(join(raiz, "app")), ...ficheros(join(raiz, "components"))];

  it("hay ficheros que revisar", () => {
    expect(archivos.length).toBeGreaterThan(10);
  });

  it("ningún fichero usa colores fuera de la paleta definida en app/globals.css", () => {
    const fallos: string[] = [];
    for (const archivo of archivos) {
      const rel = relative(raiz, archivo).replaceAll("\\", "/");
      const texto = readFileSync(archivo, "utf8");
      for (const patron of prohibidos) {
        for (const m of texto.matchAll(patron)) {
          if (permitidos[rel]?.some((p) => p.test(m[0]))) continue;
          fallos.push(`${rel}: ${m[0]}`);
        }
      }
      for (const m of texto.matchAll(/\b(bg|text|border)-(white|black)\b/g)) {
        if (permitidos[rel]?.some((p) => p.test(m[0]))) continue;
        fallos.push(`${rel}: ${m[0]}`);
      }
    }
    expect(fallos).toEqual([]);
  });
});
