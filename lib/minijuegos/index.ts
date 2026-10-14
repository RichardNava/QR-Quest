import "server-only";
import { laberinto } from "./laberinto";
import { lightsout } from "./lightsout";
import { intentoValido, mastermind, pistas, secreto } from "./mastermind";
import { rushhour } from "./rushhour";
import { sudoku } from "./sudoku";
import type { GeneradorMinijuego, Minijuego, PistasMastermind, TipoMinijuego, Vista } from "./tipos";

// Solo servidor: aquí viven las soluciones. El navegador recibe únicamente la vista pública.
const generadores: Record<TipoMinijuego, GeneradorMinijuego<never>> = {
  rushhour,
  lightsout,
  mastermind,
  sudoku,
  laberinto,
} as unknown as Record<TipoMinijuego, GeneradorMinijuego<never>>;

const TIPOS: TipoMinijuego[] = ["rushhour", "lightsout", "mastermind", "sudoku", "laberinto"];
const NIVELES_VALIDOS = ["facil", "medio", "dificil"];

/** Valida lo que llega de la base de datos (jsonb) o del cliente; `null` si no es un minijuego */
export function leerMinijuego(valor: unknown): Minijuego | null {
  if (typeof valor !== "object" || valor === null) return null;
  const { tipo, nivel, semilla } = valor as Record<string, unknown>;
  if (!TIPOS.includes(tipo as TipoMinijuego) || !NIVELES_VALIDOS.includes(nivel as string)) return null;
  if (typeof semilla !== "number" || !Number.isInteger(semilla) || semilla < 0 || semilla > 4294967295) return null;
  return { tipo, nivel, semilla } as Minijuego;
}

/** Tablero visible para el jugador: sin semilla ni solución */
export function generarVista(m: Minijuego): Vista {
  return (generadores[m.tipo] as GeneradorMinijuego).vista(m.nivel, m.semilla);
}

export function formatoValido(m: Minijuego, respuesta: unknown): boolean {
  return (generadores[m.tipo] as GeneradorMinijuego).formatoValido(respuesta);
}

export function verificarRespuesta(m: Minijuego, respuesta: unknown): boolean {
  return (generadores[m.tipo] as GeneradorMinijuego).verificar(m.nivel, m.semilla, respuesta);
}

/** Pistas de un intento de Mastermind, o `null` si el intento no es válido para el nivel */
export function pistasMastermind(m: Minijuego, codigo: unknown): PistasMastermind | null {
  if (m.tipo !== "mastermind" || !intentoValido(m.nivel, codigo)) return null;
  return pistas(m.nivel, m.semilla, codigo);
}

/**
 * Identifica el tablero: la vista pública y, en Mastermind (cuya vista es igual para todas
 * las semillas), también el código secreto. Nunca se envía al navegador.
 */
export function huella(m: Minijuego): string {
  const vista = JSON.stringify(generarVista(m));
  return m.tipo === "mastermind" ? `${vista}|${secreto(m.nivel, m.semilla).join(",")}` : vista;
}
