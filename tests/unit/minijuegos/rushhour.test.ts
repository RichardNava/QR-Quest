import { describe, expect, it } from "vitest";
import { generarVista, verificarRespuesta } from "../../../lib/minijuegos";
import { celdasPieza } from "../../../lib/minijuegos/reglas";
import { resolver } from "../../../lib/minijuegos/rushhour";
import type { Nivel, VistaRushHour } from "../../../lib/minijuegos/tipos";
import { NIVELES, semillas } from "./ayudas";

const vista = (nivel: Nivel, semilla: number) => generarVista({ tipo: "rushhour", nivel, semilla }) as VistaRushHour;

describe("rushhour", () => {
  for (const nivel of NIVELES) {
    it(`100 tableros resolubles y bien formados (${nivel})`, () => {
      for (const semilla of semillas(100)) {
        const v = vista(nivel, semilla);
        // Sin solapes, dentro del tablero y con la pieza objetivo en la fila de la salida
        const celdas = v.piezas.flatMap(celdasPieza);
        expect(new Set(celdas.map((c) => c.fila * 6 + c.col)).size).toBe(celdas.length);
        expect(celdas.every((c) => c.fila >= 0 && c.col >= 0 && c.fila < 6 && c.col < 6)).toBe(true);
        const objetivo = v.piezas.find((p) => p.objetivo)!;
        expect(objetivo.fila).toBe(v.salida.fila);
        const solucion = resolver(v.piezas);
        expect(solucion).not.toBeNull();
        expect(verificarRespuesta({ tipo: "rushhour", nivel, semilla }, { movimientos: solucion })).toBe(true);
      }
    }, 120_000);
  }

  it("rechaza tableros sin resolver y movimientos ilegales", () => {
    const m = { tipo: "rushhour" as const, nivel: "medio" as Nivel, semilla: semillas(1)[0] };
    const v = vista(m.nivel, m.semilla);
    const solucion = resolver(v.piezas)!;
    expect(solucion.length).toBeGreaterThan(1);
    expect(verificarRespuesta(m, { movimientos: [] })).toBe(false);
    expect(verificarRespuesta(m, { movimientos: solucion.slice(0, -1) })).toBe(false);
    expect(verificarRespuesta(m, { movimientos: [{ id: 999, casillas: 1 }, ...solucion] })).toBe(false);
    expect(verificarRespuesta(m, { movimientos: [{ id: 0, casillas: 99 }] })).toBe(false);
    expect(verificarRespuesta(m, { movimientos: Array(501).fill({ id: 0, casillas: 1 }) })).toBe(false);
    expect(verificarRespuesta(m, "hola")).toBe(false);
  });
});
