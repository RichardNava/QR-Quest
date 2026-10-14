import "server-only";
import { NIVELES } from "./config";
import { crearPrng } from "./prng";
import type { GeneradorMinijuego, Nivel, PistasMastermind, VistaMastermind } from "./tipos";

/** Código secreto: solo existe en el servidor, nunca forma parte de la vista pública */
export function secreto(nivel: Nivel, semilla: number): number[] {
  const { longitud, simbolos, repetidos } = NIVELES.mastermind[nivel];
  const prng = crearPrng(semilla);
  if (!repetidos) return prng.barajar(Array.from({ length: simbolos }, (_, i) => i)).slice(0, longitud);
  return Array.from({ length: longitud }, () => prng.entero(0, simbolos - 1));
}

function vista(nivel: Nivel): VistaMastermind {
  const { longitud, simbolos, intentos, repetidos } = NIVELES.mastermind[nivel];
  return { tipo: "mastermind", longitud, simbolos, intentos, repetidos };
}

/** ¿El intento tiene la longitud, el rango y (si procede) la ausencia de repetidos del nivel? */
export function intentoValido(nivel: Nivel, codigo: unknown): codigo is number[] {
  const { longitud, simbolos, repetidos } = NIVELES.mastermind[nivel];
  if (!Array.isArray(codigo) || codigo.length !== longitud) return false;
  if (!codigo.every((x) => Number.isInteger(x) && x >= 0 && x < simbolos)) return false;
  return repetidos || new Set(codigo).size === codigo.length;
}

export function pistas(nivel: Nivel, semilla: number, codigo: number[]): PistasMastermind {
  const oculto = secreto(nivel, semilla);
  let enSuSitio = 0;
  const cuentaOculto = new Map<number, number>();
  const cuentaIntento = new Map<number, number>();
  codigo.forEach((x, i) => {
    if (x === oculto[i]) {
      enSuSitio++;
    } else {
      cuentaOculto.set(oculto[i], (cuentaOculto.get(oculto[i]) ?? 0) + 1);
      cuentaIntento.set(x, (cuentaIntento.get(x) ?? 0) + 1);
    }
  });
  let enOtroSitio = 0;
  for (const [x, n] of cuentaIntento) enOtroSitio += Math.min(n, cuentaOculto.get(x) ?? 0);
  return { enSuSitio, enOtroSitio };
}

function formatoValido(respuesta: unknown): boolean {
  return (
    typeof respuesta === "object" && respuesta !== null && Array.isArray((respuesta as { codigo?: unknown }).codigo)
  );
}

function verificar(nivel: Nivel, semilla: number, respuesta: unknown): boolean {
  if (!formatoValido(respuesta)) return false;
  const codigo = (respuesta as { codigo: unknown }).codigo;
  if (!intentoValido(nivel, codigo)) return false;
  const oculto = secreto(nivel, semilla);
  return codigo.every((x, i) => x === oculto[i]);
}

export const mastermind: GeneradorMinijuego<VistaMastermind> = { vista, verificar, formatoValido };
