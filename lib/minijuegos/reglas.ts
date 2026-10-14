// Reglas puras compartidas por los verificadores (servidor) y los tableros (navegador).
// Solo operan sobre la vista pública: no contienen soluciones ni semillas.
import type { Direccion, PiezaRushHour, Posicion, VistaLaberinto } from "./tipos";

// ───────── Laberinto ─────────

/** Posición tras un paso, o `null` si hay pared o borde */
export function pasoLaberinto(
  v: Pick<VistaLaberinto, "ancho" | "alto" | "paredes">,
  pos: Posicion,
  dir: Direccion
): Posicion | null {
  const { fila, col } = pos;
  switch (dir) {
    case "N":
      return fila > 0 && !v.paredes.abajo[fila - 1][col] ? { fila: fila - 1, col } : null;
    case "S":
      return fila < v.alto - 1 && !v.paredes.abajo[fila][col] ? { fila: fila + 1, col } : null;
    case "E":
      return col < v.ancho - 1 && !v.paredes.derecha[fila][col] ? { fila, col: col + 1 } : null;
    case "O":
      return col > 0 && !v.paredes.derecha[fila][col - 1] ? { fila, col: col - 1 } : null;
  }
}

// ───────── Rush Hour ─────────

export const TAMANO_RUSH_HOUR = 6;

/** Casillas ocupadas por una pieza */
export function celdasPieza(p: PiezaRushHour): Posicion[] {
  return Array.from({ length: p.largo }, (_, i) =>
    p.horizontal ? { fila: p.fila, col: p.col + i } : { fila: p.fila + i, col: p.col }
  );
}

/** Desliza una pieza `casillas` (con signo), de una en una, sin saltar otras ni salir. `null` si es ilegal */
export function deslizar(piezas: PiezaRushHour[], id: number, casillas: number): PiezaRushHour[] | null {
  if (!Number.isInteger(casillas) || casillas === 0) return null;
  let actual = piezas.find((p) => p.id === id);
  if (!actual) return null;
  const paso = Math.sign(casillas);
  let resto = Math.abs(casillas);
  let todas = piezas;
  while (resto-- > 0) {
    const mover: PiezaRushHour = actual.horizontal
      ? { ...actual, col: actual.col + paso }
      : { ...actual, fila: actual.fila + paso };
    const nuevas = celdasPieza(mover);
    if (nuevas.some((c) => c.fila < 0 || c.col < 0 || c.fila >= TAMANO_RUSH_HOUR || c.col >= TAMANO_RUSH_HOUR)) {
      return null;
    }
    const ocupadas = new Set(
      todas.filter((p) => p.id !== id).flatMap(celdasPieza).map((c) => c.fila * TAMANO_RUSH_HOUR + c.col)
    );
    if (nuevas.some((c) => ocupadas.has(c.fila * TAMANO_RUSH_HOUR + c.col))) return null;
    todas = todas.map((p) => (p.id === id ? mover : p));
    actual = mover;
  }
  return todas;
}

/** ¿La pieza objetivo ha llegado al borde de la salida (derecha)? */
export function rushHourResuelto(piezas: PiezaRushHour[]): boolean {
  const o = piezas.find((p) => p.objetivo);
  return !!o && o.horizontal && o.col + o.largo === TAMANO_RUSH_HOUR;
}

// ───────── Lights Out ─────────

/** Tablero tras pulsar una casilla: cambia ella y sus vecinas ortogonales */
export function pulsarLuz(encendidas: boolean[][], fila: number, col: number): boolean[][] {
  const n = encendidas.length;
  const copia = encendidas.map((f) => [...f]);
  for (const [df, dc] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const f = fila + df;
    const c = col + dc;
    if (f >= 0 && c >= 0 && f < n && c < n) copia[f][c] = !copia[f][c];
  }
  return copia;
}

export function todoApagado(encendidas: boolean[][]): boolean {
  return encendidas.every((f) => f.every((x) => !x));
}
