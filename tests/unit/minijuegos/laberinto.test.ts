import { describe, expect, it } from "vitest";
import { generarVista, verificarRespuesta } from "../../../lib/minijuegos";
import { pasoLaberinto } from "../../../lib/minijuegos/reglas";
import type { Direccion, Nivel, VistaLaberinto } from "../../../lib/minijuegos/tipos";
import { NIVELES, semillas } from "./ayudas";

const vista = (nivel: Nivel, semilla: number) => generarVista({ tipo: "laberinto", nivel, semilla }) as VistaLaberinto;

/** Camino más corto (búsqueda en anchura) y número de pasillos abiertos */
function resolver(v: VistaLaberinto): { camino: Direccion[] | null; pasillos: number } {
  const previo = new Map<string, { de: string; dir: Direccion } | null>();
  const clave = (f: number, c: number) => `${f},${c}`;
  previo.set(clave(0, 0), null);
  const cola = [{ fila: 0, col: 0 }];
  let pasillos = 0;
  for (let i = 0; i < cola.length; i++) {
    const p = cola[i];
    for (const d of ["N", "S", "E", "O"] as Direccion[]) {
      const q = pasoLaberinto(v, p, d);
      if (!q) continue;
      if (d === "S" || d === "E") pasillos++;
      if (previo.has(clave(q.fila, q.col))) continue;
      previo.set(clave(q.fila, q.col), { de: clave(p.fila, p.col), dir: d });
      cola.push(q);
    }
  }
  let k = clave(v.meta.fila, v.meta.col);
  if (!previo.has(k)) return { camino: null, pasillos };
  const camino: Direccion[] = [];
  while (previo.get(k)) {
    const e = previo.get(k)!;
    camino.push(e.dir);
    k = e.de;
  }
  return { camino: camino.reverse(), pasillos };
}

describe("laberinto", () => {
  for (const nivel of NIVELES) {
    it(`es perfecto y resoluble (${nivel})`, () => {
      for (const semilla of semillas(100)) {
        const v = vista(nivel, semilla);
        const { camino, pasillos } = resolver(v);
        expect(camino).not.toBeNull();
        // Perfecto: conecta todas las casillas con exactamente ancho·alto − 1 pasillos
        expect(pasillos).toBe(v.ancho * v.alto - 1);
        expect(verificarRespuesta({ tipo: "laberinto", nivel, semilla }, { movimientos: camino })).toBe(true);
      }
    });
  }

  it("rechaza lo que no lleva a la meta o cruza una pared", () => {
    const m = { tipo: "laberinto" as const, nivel: "facil" as Nivel, semilla: semillas(1)[0] };
    const { camino } = resolver(vista(m.nivel, m.semilla));
    expect(verificarRespuesta(m, { movimientos: [] })).toBe(false);
    expect(verificarRespuesta(m, { movimientos: camino!.slice(0, -1) })).toBe(false);
    // Salir del tablero por arriba desde la casilla de inicio
    expect(verificarRespuesta(m, { movimientos: ["N", ...camino!] })).toBe(false);
    expect(verificarRespuesta(m, { movimientos: Array(3001).fill("E") })).toBe(false);
    expect(verificarRespuesta(m, { movimientos: ["X"] })).toBe(false);
    expect(verificarRespuesta(m, null)).toBe(false);
  });

  it("misma semilla, mismo laberinto", () => {
    expect(vista("medio", 123)).toEqual(vista("medio", 123));
  });
});
