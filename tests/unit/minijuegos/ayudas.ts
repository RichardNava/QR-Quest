import type { Nivel, TipoMinijuego } from "../../../lib/minijuegos/tipos";

export const TIPOS: TipoMinijuego[] = ["rushhour", "lightsout", "mastermind", "sudoku", "laberinto"];
export const NIVELES: Nivel[] = ["facil", "medio", "dificil"];

/** `n` semillas distintas y reproducibles */
export function semillas(n: number): number[] {
  return Array.from({ length: n }, (_, i) => ((i + 1) * 2654435761) >>> 0);
}

/** Ejecuta `fn` para cada combinación de tipo y nivel */
export function porCadaTipoYNivel(fn: (tipo: TipoMinijuego, nivel: Nivel) => void) {
  for (const tipo of TIPOS) for (const nivel of NIVELES) fn(tipo, nivel);
}
