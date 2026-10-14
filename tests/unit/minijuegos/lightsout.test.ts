import { describe, expect, it } from "vitest";
import { generarVista, verificarRespuesta } from "../../../lib/minijuegos";
import { NIVELES as CONFIG } from "../../../lib/minijuegos/config";
import { pulsarLuz } from "../../../lib/minijuegos/reglas";
import type { Nivel, Posicion, VistaLightsOut } from "../../../lib/minijuegos/tipos";
import { NIVELES, semillas } from "./ayudas";

const vista = (nivel: Nivel, semilla: number) => generarVista({ tipo: "lightsout", nivel, semilla }) as VistaLightsOut;

/** Soluciona el tablero por eliminación gaussiana en GF(2), sin conocer cómo se generó */
function resolver(v: VistaLightsOut): Posicion[] | null {
  const n = v.tamano;
  const total = n * n;
  const filas: number[][] = [];
  for (let i = 0; i < total; i++) {
    const fila = Array<number>(total + 1).fill(0);
    const f = Math.floor(i / n);
    const c = i % n;
    // Pulsar la casilla j afecta a la casilla i si son la misma o vecinas
    for (let j = 0; j < total; j++) {
      const g = Math.floor(j / n);
      const d = j % n;
      if (Math.abs(f - g) + Math.abs(c - d) <= 1) fila[j] = 1;
    }
    fila[total] = v.encendidas[f][c] ? 1 : 0;
    filas.push(fila);
  }
  let r = 0;
  const pivote: number[] = [];
  for (let col = 0; col < total && r < total; col++) {
    const p = filas.findIndex((f, i) => i >= r && f[col]);
    if (p < 0) continue;
    [filas[r], filas[p]] = [filas[p], filas[r]];
    for (let i = 0; i < total; i++) if (i !== r && filas[i][col]) filas[i] = filas[i].map((x, k) => x ^ filas[r][k]);
    pivote[r] = col;
    r++;
  }
  if (filas.slice(r).some((f) => f[total])) return null;
  const pulsadas: Posicion[] = [];
  for (let i = 0; i < r; i++) {
    if (filas[i][total]) pulsadas.push({ fila: Math.floor(pivote[i] / n), col: pivote[i] % n });
  }
  return pulsadas;
}

describe("lightsout", () => {
  for (const nivel of NIVELES) {
    it(`100 tableros resolubles y no triviales (${nivel})`, () => {
      for (const semilla of semillas(100)) {
        const v = vista(nivel, semilla);
        expect(v.tamano).toBe(CONFIG.lightsout[nivel].tamano);
        expect(v.encendidas.flat().some(Boolean)).toBe(true);
        const solucion = resolver(v);
        expect(solucion).not.toBeNull();
        expect(verificarRespuesta({ tipo: "lightsout", nivel, semilla }, { pulsadas: solucion })).toBe(true);
      }
    });
  }

  it("pulsar dos veces la misma casilla se anula", () => {
    const v = vista("medio", 7);
    const una = pulsarLuz(v.encendidas, 1, 2);
    expect(una).not.toEqual(v.encendidas);
    expect(pulsarLuz(una, 1, 2)).toEqual(v.encendidas);
  });

  it("rechaza respuestas incompletas o fuera del tablero", () => {
    const m = { tipo: "lightsout" as const, nivel: "facil" as Nivel, semilla: 5 };
    const solucion = resolver(vista(m.nivel, m.semilla))!;
    expect(verificarRespuesta(m, { pulsadas: [] })).toBe(false);
    expect(verificarRespuesta(m, { pulsadas: solucion.slice(1) })).toBe(false);
    expect(verificarRespuesta(m, { pulsadas: [{ fila: 9, col: 0 }, ...solucion] })).toBe(false);
    expect(verificarRespuesta(m, { pulsadas: Array(101).fill({ fila: 0, col: 0 }) })).toBe(false);
    expect(verificarRespuesta(m, {})).toBe(false);
  });
});
