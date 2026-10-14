import { describe, expect, it } from "vitest";
import { generarVista } from "../../../lib/minijuegos";
import { NIVELES as CONFIG } from "../../../lib/minijuegos/config";
import { resolver } from "../../../lib/minijuegos/rushhour";
import type { Nivel, VistaRushHour, VistaSudoku } from "../../../lib/minijuegos/tipos";
import { NIVELES, semillas } from "./ayudas";

const media = (n: number[]) => n.reduce((a, b) => a + b, 0) / n.length;
const crece = (m: number[]) => {
  expect(m[0]).toBeLessThan(m[1]);
  expect(m[1]).toBeLessThan(m[2]);
};

describe("la dificultad crece de fácil a medio a difícil", () => {
  it("Rush Hour: movimientos mínimos", () => {
    const medias = NIVELES.map((nivel: Nivel) =>
      media(
        semillas(30).map((semilla) => {
          const v = generarVista({ tipo: "rushhour", nivel, semilla }) as VistaRushHour;
          return resolver(v.piezas)!.length;
        })
      )
    );
    crece(medias);
  }, 120_000);

  it("Rush Hour: alcanza el mínimo del nivel en al menos el 90 % de los tableros", () => {
    for (const nivel of NIVELES) {
      const minimo = CONFIG.rushhour[nivel].minMovimientos;
      const logrados = semillas(40).filter((semilla) => {
        const v = generarVista({ tipo: "rushhour", nivel, semilla }) as VistaRushHour;
        return resolver(v.piezas)!.length >= minimo;
      });
      expect(logrados.length / 40).toBeGreaterThanOrEqual(0.9);
    }
  }, 120_000);

  it("Sudoku: casillas vacías", () => {
    const medias = NIVELES.map((nivel: Nivel) =>
      media(
        semillas(20).map((semilla) => {
          const v = generarVista({ tipo: "sudoku", nivel, semilla }) as VistaSudoku;
          return v.casillas.flat().filter((x) => x === null).length;
        })
      )
    );
    crece(medias);
  });

  it("Laberinto, Lights Out y Mastermind: tamaño del problema", () => {
    crece(NIVELES.map((n) => CONFIG.laberinto[n].ancho * CONFIG.laberinto[n].alto));
    crece(NIVELES.map((n) => CONFIG.lightsout[n].tamano));
    // Combinaciones posibles: sin repetidos son permutaciones, con repetidos son variaciones
    crece(
      NIVELES.map((n) => {
        const { simbolos, longitud, repetidos } = CONFIG.mastermind[n];
        let total = 1;
        for (let i = 0; i < longitud; i++) total *= repetidos ? simbolos : simbolos - i;
        return total;
      })
    );
  });
});
