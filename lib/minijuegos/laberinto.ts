import "server-only";
import { NIVELES } from "./config";
import { crearPrng } from "./prng";
import { pasoLaberinto } from "./reglas";
import type { Direccion, GeneradorMinijuego, Nivel, Posicion, VistaLaberinto } from "./tipos";

const MAX_MOVIMIENTOS = 3000;
const DIRECCIONES: Direccion[] = ["N", "S", "E", "O"];

/** Laberinto perfecto (un único camino entre dos casillas) por retroceso con pila */
function vista(nivel: Nivel, semilla: number): VistaLaberinto {
  const { ancho, alto } = NIVELES.laberinto[nivel];
  const prng = crearPrng(semilla);
  const derecha = Array.from({ length: alto }, () => Array<boolean>(ancho).fill(true));
  const abajo = Array.from({ length: alto }, () => Array<boolean>(ancho).fill(true));
  const visitada = Array.from({ length: alto }, () => Array<boolean>(ancho).fill(false));

  const pila: Posicion[] = [{ fila: 0, col: 0 }];
  visitada[0][0] = true;
  while (pila.length) {
    const { fila, col } = pila[pila.length - 1];
    const vecinas = prng
      .barajar<[number, number]>([[-1, 0], [1, 0], [0, 1], [0, -1]])
      .filter(([df, dc]) => {
        const f = fila + df;
        const c = col + dc;
        return f >= 0 && c >= 0 && f < alto && c < ancho && !visitada[f][c];
      });
    if (vecinas.length === 0) {
      pila.pop();
      continue;
    }
    const [df, dc] = vecinas[0];
    const f = fila + df;
    const c = col + dc;
    if (df === 1) abajo[fila][col] = false;
    else if (df === -1) abajo[f][c] = false;
    else if (dc === 1) derecha[fila][col] = false;
    else derecha[f][c] = false;
    visitada[f][c] = true;
    pila.push({ fila: f, col: c });
  }

  return {
    tipo: "laberinto",
    ancho,
    alto,
    paredes: { derecha, abajo },
    inicio: { fila: 0, col: 0 },
    meta: { fila: alto - 1, col: ancho - 1 },
  };
}

function formatoValido(respuesta: unknown): boolean {
  if (typeof respuesta !== "object" || respuesta === null) return false;
  const m = (respuesta as { movimientos?: unknown }).movimientos;
  return Array.isArray(m) && m.length <= MAX_MOVIMIENTOS && m.every((d) => DIRECCIONES.includes(d as Direccion));
}

function verificar(nivel: Nivel, semilla: number, respuesta: unknown): boolean {
  if (!formatoValido(respuesta)) return false;
  const v = vista(nivel, semilla);
  let pos = v.inicio;
  for (const d of (respuesta as { movimientos: Direccion[] }).movimientos) {
    const siguiente = pasoLaberinto(v, pos, d);
    if (!siguiente) return false;
    pos = siguiente;
  }
  return pos.fila === v.meta.fila && pos.col === v.meta.col;
}

export const laberinto: GeneradorMinijuego<VistaLaberinto> = { vista, verificar, formatoValido };
