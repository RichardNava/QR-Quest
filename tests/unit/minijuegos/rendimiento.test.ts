import { describe, expect, it } from "vitest";
import { generarVista, verificarRespuesta } from "../../../lib/minijuegos";
import { TIPOS, semillas } from "./ayudas";

// CE-003: generar y mostrar un minijuego tarda menos de 2 s; aquí se exige 500 ms de media en el nivel difícil
describe("rendimiento de la generación (nivel difícil)", () => {
  for (const tipo of TIPOS) {
    it(`${tipo}: menos de 500 ms de media`, () => {
      const lista = semillas(20);
      const inicio = performance.now();
      for (const semilla of lista) generarVista({ tipo, nivel: "dificil", semilla });
      const media = (performance.now() - inicio) / lista.length;
      expect(media, `${tipo} tardó ${media.toFixed(0)} ms de media`).toBeLessThan(500);
    }, 60_000);
  }

  it("verificar una respuesta incorrecta también es rápido (el servidor regenera el tablero)", () => {
    for (const tipo of TIPOS) {
      const inicio = performance.now();
      verificarRespuesta({ tipo, nivel: "dificil", semilla: 1234 }, { movimientos: [], pulsadas: [], casillas: [], codigo: [] });
      expect(performance.now() - inicio).toBeLessThan(1500);
    }
  });
});
