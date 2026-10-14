import "server-only";
import { NIVELES } from "./config";
import { crearPrng } from "./prng";
import { pulsarLuz, todoApagado } from "./reglas";
import type { GeneradorMinijuego, Nivel, Posicion, VistaLightsOut } from "./tipos";

const MAX_PULSACIONES = 100;

/** Parte del tablero apagado y pulsa casillas al azar: es resoluble por construcción */
function vista(nivel: Nivel, semilla: number): VistaLightsOut {
  const { tamano, pulsaciones } = NIVELES.lightsout[nivel];
  const prng = crearPrng(semilla);
  const casillas: Posicion[] = [];
  for (let f = 0; f < tamano; f++) for (let c = 0; c < tamano; c++) casillas.push({ fila: f, col: c });

  for (;;) {
    let tablero = Array.from({ length: tamano }, () => Array<boolean>(tamano).fill(false));
    for (const { fila, col } of prng.barajar(casillas).slice(0, pulsaciones)) {
      tablero = pulsarLuz(tablero, fila, col);
    }
    if (!todoApagado(tablero)) return { tipo: "lightsout", tamano, encendidas: tablero };
  }
}

function formatoValido(respuesta: unknown): boolean {
  if (typeof respuesta !== "object" || respuesta === null) return false;
  const p = (respuesta as { pulsadas?: unknown }).pulsadas;
  return (
    Array.isArray(p) &&
    p.length <= MAX_PULSACIONES &&
    p.every(
      (x) =>
        typeof x === "object" &&
        x !== null &&
        Number.isInteger((x as Posicion).fila) &&
        Number.isInteger((x as Posicion).col)
    )
  );
}

function verificar(nivel: Nivel, semilla: number, respuesta: unknown): boolean {
  if (!formatoValido(respuesta)) return false;
  let tablero = vista(nivel, semilla).encendidas;
  const n = tablero.length;
  for (const { fila, col } of (respuesta as { pulsadas: Posicion[] }).pulsadas) {
    if (fila < 0 || col < 0 || fila >= n || col >= n) return false;
    tablero = pulsarLuz(tablero, fila, col);
  }
  return todoApagado(tablero);
}

export const lightsout: GeneradorMinijuego<VistaLightsOut> = { vista, verificar, formatoValido };
