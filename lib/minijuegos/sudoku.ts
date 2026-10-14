import "server-only";
import { NIVELES } from "./config";
import { crearPrng, type Prng } from "./prng";
import type { GeneradorMinijuego, Nivel, VistaSudoku } from "./tipos";

type Cuadricula = number[][]; // 0 = hueco

/** Candidatos de una casilla como máscara de bits (bit n-1 = el número n cabe) */
function candidatos(g: Cuadricula, f: number, c: number): number {
  let usados = 0;
  const bf = Math.floor(f / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let i = 0; i < 9; i++) {
    if (g[f][i]) usados |= 1 << (g[f][i] - 1);
    if (g[i][c]) usados |= 1 << (g[i][c] - 1);
    const v = g[bf + Math.floor(i / 3)][bc + (i % 3)];
    if (v) usados |= 1 << (v - 1);
  }
  return ~usados & 0x1ff;
}

const numeros = (mascara: number) => {
  const n: number[] = [];
  for (let i = 0; i < 9; i++) if (mascara & (1 << i)) n.push(i + 1);
  return n;
};
const contarBits = (m: number) => {
  let n = 0;
  while (m) {
    n += m & 1;
    m >>= 1;
  }
  return n;
};

/** Casilla vacía con menos candidatos (heurística MRV); `null` si está completa */
function mejorHueco(g: Cuadricula): { f: number; c: number; m: number } | null {
  let mejor: { f: number; c: number; m: number } | null = null;
  let menos = 10;
  for (let f = 0; f < 9; f++) {
    for (let c = 0; c < 9; c++) {
      if (g[f][c]) continue;
      const m = candidatos(g, f, c);
      const n = contarBits(m);
      if (n < menos) {
        menos = n;
        mejor = { f, c, m };
        if (n <= 1) return mejor;
      }
    }
  }
  return mejor;
}

/** Rellena la cuadrícula por retroceso; el orden de los candidatos lo decide el PRNG */
function rellenar(g: Cuadricula, prng: Prng): boolean {
  const hueco = mejorHueco(g);
  if (!hueco) return true;
  if (hueco.m === 0) return false;
  for (const n of prng.barajar(numeros(hueco.m))) {
    g[hueco.f][hueco.c] = n;
    if (rellenar(g, prng)) return true;
  }
  g[hueco.f][hueco.c] = 0;
  return false;
}

/** Cuenta soluciones hasta `limite` */
export function contarSoluciones(g: Cuadricula, limite: number): number {
  const hueco = mejorHueco(g);
  if (!hueco) return 1;
  if (hueco.m === 0) return 0;
  let total = 0;
  for (const n of numeros(hueco.m)) {
    g[hueco.f][hueco.c] = n;
    total += contarSoluciones(g, limite - total);
    if (total >= limite) break;
  }
  g[hueco.f][hueco.c] = 0;
  return total;
}

export function generar(nivel: Nivel, semilla: number): { solucion: Cuadricula; casillas: Cuadricula } {
  const { pistas } = NIVELES.sudoku[nivel];
  const prng = crearPrng(semilla);
  const solucion: Cuadricula = Array.from({ length: 9 }, () => Array<number>(9).fill(0));
  rellenar(solucion, prng);

  const casillas = solucion.map((f) => [...f]);
  let quedan = 81;
  for (const i of prng.barajar(Array.from({ length: 81 }, (_, k) => k))) {
    if (quedan <= pistas) break;
    const f = Math.floor(i / 9);
    const c = i % 9;
    const valor = casillas[f][c];
    casillas[f][c] = 0;
    if (contarSoluciones(casillas, 2) === 1) quedan--;
    else casillas[f][c] = valor;
  }
  return { solucion, casillas };
}

function vista(nivel: Nivel, semilla: number): VistaSudoku {
  return { tipo: "sudoku", casillas: generar(nivel, semilla).casillas.map((f) => f.map((v) => v || null)) };
}

function formatoValido(respuesta: unknown): boolean {
  if (typeof respuesta !== "object" || respuesta === null) return false;
  const c = (respuesta as { casillas?: unknown }).casillas;
  return (
    Array.isArray(c) &&
    c.length === 9 &&
    c.every((f) => Array.isArray(f) && f.length === 9 && f.every((v) => Number.isInteger(v) && v >= 1 && v <= 9))
  );
}

function verificar(nivel: Nivel, semilla: number, respuesta: unknown): boolean {
  if (!formatoValido(respuesta)) return false;
  const { solucion } = generar(nivel, semilla);
  const dada = (respuesta as { casillas: number[][] }).casillas;
  return solucion.every((fila, f) => fila.every((v, c) => v === dada[f][c]));
}

export const sudoku: GeneradorMinijuego<VistaSudoku> = { vista, verificar, formatoValido };
