import { describe, expect, it } from "vitest";
import { generarVista, huella } from "../../../lib/minijuegos";
import { porCadaTipoYNivel, semillas } from "./ayudas";

describe("generación determinista y variada", () => {
  porCadaTipoYNivel((tipo, nivel) => {
    it(`${tipo} · ${nivel}: misma semilla, mismo tablero; semillas distintas, huellas distintas`, () => {
      const lista = semillas(tipo === "rushhour" || tipo === "sudoku" ? 30 : 100);
      const huellas = new Set<string>();
      for (const semilla of lista) {
        const m = { tipo, nivel, semilla };
        expect(generarVista(m)).toEqual(generarVista(m));
        huellas.add(huella(m));
      }
      // Lights Out 3×3 solo tiene 512 estados: se pide al menos la mitad distintas
      const minimo = tipo === "lightsout" && nivel === "facil" ? lista.length / 2 : lista.length * 0.9;
      expect(huellas.size).toBeGreaterThanOrEqual(minimo);
    }, 60_000);
  });
});
