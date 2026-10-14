import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { generarVista } from "../../../lib/minijuegos";
import { secreto } from "../../../lib/minijuegos/mastermind";
import { porCadaTipoYNivel, semillas } from "./ayudas";

const raiz = join(__dirname, "..", "..", "..");
const leer = (ruta: string) => readFileSync(join(raiz, ruta), "utf-8");

describe("la vista pública no filtra nada (RF-008)", () => {
  porCadaTipoYNivel((tipo, nivel) => {
    it(`${tipo} · ${nivel}: sin semilla ni claves de solución`, () => {
      for (const semilla of semillas(3)) {
        const vista = generarVista({ tipo, nivel, semilla });
        const texto = JSON.stringify(vista);
        expect(texto).not.toContain("semilla");
        expect(texto).not.toContain("solucion");
        expect(texto).not.toContain("secreto");
        expect(texto).not.toContain("contrasena");
        // La semilla no aparece como número suelto entre los datos
        expect(texto).not.toMatch(new RegExp(`[^0-9]${semilla}[^0-9]`));
        if (tipo === "mastermind") expect(texto).not.toContain(secreto(nivel, semilla).join(","));
      }
    });
  });

  it("la página del jugador nunca selecciona la contraseña", () => {
    const pagina = leer("app/p/[token]/page.tsx");
    const selects = [...pagina.matchAll(/\.select\(([^)]*)\)/g)].map((m) => m[1]);
    expect(selects.length).toBeGreaterThan(0);
    for (const s of selects) expect(s).not.toContain("contrasena");
    expect(pagina).not.toMatch(/semilla/);
  });

  it("los componentes de cliente solo importan tipos, config y reglas de lib/minijuegos", () => {
    const ficheros = [
      ...readdirSync(join(raiz, "components", "minijuegos")).map((f) => `components/minijuegos/${f}`),
      "components/SelectorMinijuego.tsx",
      "components/EditorPuzzle.tsx",
    ];
    for (const f of ficheros) {
      const importaciones = [...leer(f).matchAll(/from "(@\/lib\/minijuegos[^"]*)"/g)].map((m) => m[1]);
      for (const i of importaciones) {
        expect(["@/lib/minijuegos/tipos", "@/lib/minijuegos/config", "@/lib/minijuegos/reglas"], `${f} importa ${i}`).toContain(i);
      }
    }
  });

  it("los módulos con lógica del servidor empiezan con import \"server-only\"", () => {
    for (const f of ["index", "rushhour", "lightsout", "mastermind", "sudoku", "laberinto"]) {
      expect(leer(`lib/minijuegos/${f}.ts`)).toMatch(/^import "server-only";/);
    }
  });
});
