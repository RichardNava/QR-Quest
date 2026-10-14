import { describe, expect, it } from "vitest";
import { generarVista, huella, pistasMastermind, verificarRespuesta } from "../../../lib/minijuegos";
import { NIVELES as CONFIG } from "../../../lib/minijuegos/config";
import { secreto } from "../../../lib/minijuegos/mastermind";
import type { Minijuego, Nivel } from "../../../lib/minijuegos/tipos";
import { NIVELES, semillas } from "./ayudas";

const mm = (nivel: Nivel, semilla: number): Minijuego => ({ tipo: "mastermind", nivel, semilla });

describe("mastermind", () => {
  it("la vista pública no contiene el secreto", () => {
    for (const nivel of NIVELES) {
      for (const semilla of semillas(50)) {
        const vista = generarVista(mm(nivel, semilla));
        expect(Object.keys(vista).sort()).toEqual(["intentos", "longitud", "repetidos", "simbolos", "tipo"]);
      }
    }
  });

  it("el secreto respeta longitud, rango y repetidos del nivel", () => {
    for (const nivel of NIVELES) {
      const { longitud, simbolos, repetidos } = CONFIG.mastermind[nivel];
      for (const semilla of semillas(100)) {
        const s = secreto(nivel, semilla);
        expect(s).toHaveLength(longitud);
        expect(s.every((x) => x >= 0 && x < simbolos)).toBe(true);
        if (!repetidos) expect(new Set(s).size).toBe(longitud);
      }
    }
  });

  it("acertar el código da todo en su sitio; invertirlo conserva el total", () => {
    const m = mm("medio", 99);
    const s = secreto("medio", 99);
    expect(pistasMastermind(m, s)).toEqual({ enSuSitio: 4, enOtroSitio: 0 });
    const p = pistasMastermind(m, [...s].reverse())!;
    expect(p.enSuSitio + p.enOtroSitio).toBe(4);
  });

  it("cuenta bien los repetidos (secreto 1,1,2,3 frente a 1,2,1,1)", () => {
    // Se busca una semilla cuyo secreto sea exactamente 1,1,2,3 (hay muchas entre 20 000)
    const semilla = Array.from({ length: 20000 }, (_, i) => i + 1).find((x) => secreto("medio", x).join() === "1,1,2,3");
    expect(semilla).toBeDefined();
    expect(pistasMastermind(mm("medio", semilla!), [1, 2, 1, 1])).toEqual({ enSuSitio: 1, enOtroSitio: 2 });
  });

  it("rechaza intentos inválidos y solo acepta el secreto", () => {
    const m = mm("facil", 3);
    const s = secreto("facil", 3);
    expect(verificarRespuesta(m, { codigo: s })).toBe(true);
    expect(verificarRespuesta(m, { codigo: [...s].reverse() })).toBe(false);
    expect(pistasMastermind(m, [0, 0, 1, 2])).toBeNull(); // repetidos no permitidos en fácil
    expect(pistasMastermind(m, [0, 1, 2])).toBeNull();
    expect(pistasMastermind(m, [0, 1, 2, 9])).toBeNull();
    expect(pistasMastermind(m, "0123")).toBeNull();
  });

  it("la huella distingue secretos aunque la vista sea igual", () => {
    const huellas = new Set(semillas(50).map((s) => huella(mm("dificil", s))));
    expect(huellas.size).toBeGreaterThan(40);
  });
});
