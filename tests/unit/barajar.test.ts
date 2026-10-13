import { describe, expect, it } from "vitest";
import { barajar, estaResuelto } from "../../lib/barajar";

describe("barajar", () => {
  for (const n of [4, 9]) {
    it(`devuelve una permutación no resuelta para n=${n}`, () => {
      for (let i = 0; i < 200; i++) {
        const orden = barajar(n);
        expect([...orden].sort((a, b) => a - b)).toEqual(Array.from({ length: n }, (_, k) => k));
        expect(estaResuelto(orden)).toBe(false);
      }
    });
  }
  it("n < 2 devuelve el orden tal cual", () => {
    expect(barajar(1)).toEqual([0]);
    expect(barajar(0)).toEqual([]);
  });
});
