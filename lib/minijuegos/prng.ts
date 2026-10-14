export type Prng = {
  /** Número en [0, 1) */
  siguiente(): number;
  /** Entero en [min, max], ambos incluidos */
  entero(min: number, max: number): number;
  /** Copia barajada (Fisher-Yates con la semilla) */
  barajar<T>(lista: T[]): T[];
};

/** mulberry32: mismo resultado para la misma semilla */
export function crearPrng(semilla: number): Prng {
  let a = semilla >>> 0;
  const siguiente = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const entero = (min: number, max: number) => min + Math.floor(siguiente() * (max - min + 1));
  const barajar = <T,>(lista: T[]): T[] => {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = entero(0, i);
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  };
  return { siguiente, entero, barajar };
}

/** Semilla nueva de 32 bits, impredecible (se crea en el servidor) */
export function nuevaSemilla(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0];
}
