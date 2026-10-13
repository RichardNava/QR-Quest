import { describe, expect, it } from "vitest";
import { normalizar } from "../../lib/normalizar";

describe("normalizar", () => {
  it("quita tildes, mayúsculas y espacios extremos", () => {
    expect(normalizar("  Árbol ")).toBe("arbol");
    expect(normalizar("CAFÉ")).toBe("cafe");
    expect(normalizar("Ñandú")).toBe("nandu");
  });
  it("cadena vacía", () => expect(normalizar("")).toBe(""));
  it("textos que solo difieren en mayúsculas/tildes/espacios extremos son iguales", () => {
    expect(normalizar(" CANCIÓN")).toBe(normalizar("cancion  "));
  });
  it("conserva espacios interiores", () => {
    expect(normalizar("Hola  Mundo")).toBe("hola  mundo");
  });
});
