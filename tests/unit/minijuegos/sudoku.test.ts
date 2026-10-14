import { describe, expect, it } from "vitest";
import { generarVista, verificarRespuesta } from "../../../lib/minijuegos";
import { NIVELES as CONFIG } from "../../../lib/minijuegos/config";
import { generar } from "../../../lib/minijuegos/sudoku";
import type { Nivel, VistaSudoku } from "../../../lib/minijuegos/tipos";
import { NIVELES, semillas } from "./ayudas";

/** Contador de soluciones independiente de la implementación (primera casilla vacía, hasta 2) */
function contar(g: number[][]): number {
  const filas = Array<number>(9).fill(0);
  const cols = Array<number>(9).fill(0);
  const bloques = Array<number>(9).fill(0);
  const huecos: [number, number][] = [];
  for (let f = 0; f < 9; f++) {
    for (let c = 0; c < 9; c++) {
      if (g[f][c]) {
        const bit = 1 << g[f][c];
        filas[f] |= bit;
        cols[c] |= bit;
        bloques[Math.floor(f / 3) * 3 + Math.floor(c / 3)] |= bit;
      } else {
        huecos.push([f, c]);
      }
    }
  }
  let total = 0;
  const ir = (i: number) => {
    if (total >= 2) return;
    if (i === huecos.length) {
      total++;
      return;
    }
    const [f, c] = huecos[i];
    const b = Math.floor(f / 3) * 3 + Math.floor(c / 3);
    for (let n = 1; n <= 9; n++) {
      const bit = 1 << n;
      if ((filas[f] | cols[c] | bloques[b]) & bit) continue;
      filas[f] |= bit;
      cols[c] |= bit;
      bloques[b] |= bit;
      ir(i + 1);
      filas[f] &= ~bit;
      cols[c] &= ~bit;
      bloques[b] &= ~bit;
    }
  };
  ir(0);
  return total;
}

const vista = (nivel: Nivel, semilla: number) => generarVista({ tipo: "sudoku", nivel, semilla }) as VistaSudoku;

describe("sudoku", () => {
  for (const nivel of NIVELES) {
    it(`100 tableros con solución única y pistas del nivel (${nivel})`, () => {
      for (const semilla of semillas(100)) {
        const v = vista(nivel, semilla);
        const g = v.casillas.map((f) => f.map((x) => x ?? 0));
        const dadas = g.flat().filter(Boolean).length;
        expect(dadas).toBeGreaterThanOrEqual(CONFIG.sudoku[nivel].pistas);
        expect(dadas).toBeLessThanOrEqual(CONFIG.sudoku[nivel].pistas + 8);
        expect(contar(g)).toBe(1);
        // La vista respeta la solución
        const { solucion } = generar(nivel, semilla);
        g.forEach((fila, f) => fila.forEach((x, c) => x && expect(x).toBe(solucion[f][c])));
        expect(verificarRespuesta({ tipo: "sudoku", nivel, semilla }, { casillas: solucion })).toBe(true);
      }
    }, 120_000);
  }

  it("rechaza cuadrículas incorrectas", () => {
    const m = { tipo: "sudoku" as const, nivel: "facil" as Nivel, semilla: 11 };
    const { solucion } = generar(m.nivel, m.semilla);
    const mala = solucion.map((f) => [...f]);
    mala[4][4] = (mala[4][4] % 9) + 1;
    expect(verificarRespuesta(m, { casillas: mala })).toBe(false);
    expect(verificarRespuesta(m, { casillas: solucion.slice(1) })).toBe(false);
    expect(verificarRespuesta(m, { casillas: solucion.map((f) => f.map(() => 10)) })).toBe(false);
    expect(verificarRespuesta(m, { casillas: vista(m.nivel, m.semilla).casillas })).toBe(false); // con huecos
    expect(verificarRespuesta(m, null)).toBe(false);
  });
});
