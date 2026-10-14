import "server-only";
import { NIVELES } from "./config";
import { crearPrng, type Prng } from "./prng";
import { celdasPieza, deslizar, rushHourResuelto, TAMANO_RUSH_HOUR as N } from "./reglas";
import type { GeneradorMinijuego, Nivel, PiezaRushHour, RespuestaRushHour, VistaRushHour } from "./tipos";

const MAX_MOVIMIENTOS = 500;
const FILA_SALIDA = 2;
const MAX_ESTADOS = 12000;

type Paso = { id: number; casillas: number };

/** Posición variable de una pieza a lo largo de su eje */
const posicion = (p: PiezaRushHour) => (p.horizontal ? p.col : p.fila);

// Un estado del tablero es un número: la posición de cada pieza como cifra en base 5 (0..4)
const BASE = 5;
const potencias = (n: number) => Array.from({ length: n }, (_, i) => BASE ** (n - 1 - i));
const claveDe = (pos: number[], pot: number[]) => pos.reduce((acc, p, i) => acc + p * pot[i], 0);

const actual = new Int8Array(16); // posiciones del estado que se está expandiendo
const libre = new Uint8Array(N * N);

/**
 * Recorre los estados vecinos de `clave`: cada «movimiento» desliza una pieza cualquier número de
 * casillas libres. Si `visitar` devuelve `true`, se detiene el recorrido y se devuelve `true`.
 */
function recorrerVecinos(
  piezas: PiezaRushHour[],
  pot: number[],
  clave: number,
  visitar: (nueva: number, i: number, casillas: number) => boolean | void
): boolean {
  const n = piezas.length;
  let resto = clave;
  for (let i = n - 1; i >= 0; i--) {
    const cifra = resto % BASE;
    actual[i] = cifra;
    resto = (resto - cifra) / BASE;
  }
  libre.fill(1);
  for (let i = 0; i < n; i++) {
    const p = piezas[i];
    for (let k = 0; k < p.largo; k++) {
      libre[(p.horizontal ? p.fila : actual[i] + k) * N + (p.horizontal ? actual[i] + k : p.col)] = 0;
    }
  }
  for (let i = 0; i < n; i++) {
    const p = piezas[i];
    const origen = actual[i];
    for (let s = 0; s < 2; s++) {
      const sentido = s * 2 - 1;
      for (let d = 1; ; d++) {
        const destino = origen + sentido * d;
        // casilla que pasa a ocupar el borde de avance de la pieza
        const borde = sentido === 1 ? destino + p.largo - 1 : destino;
        if (borde < 0 || borde >= N) break;
        if (!libre[(p.horizontal ? p.fila : borde) * N + (p.horizontal ? borde : p.col)]) break;
        if (visitar(clave + sentido * d * pot[i], i, sentido * d)) return true;
      }
    }
  }
  return false;
}

/**
 * Búsqueda en anchura sobre los estados del tablero. Devuelve la solución más corta
 * (lista de movimientos), o `null` si no tiene solución.
 */
export function resolver(piezas: PiezaRushHour[]): Paso[] | null {
  const objetivo = piezas.findIndex((p) => p.objetivo);
  if (objetivo < 0) return null;
  const pot = potencias(piezas.length);
  const inicio = claveDe(piezas.map(posicion), pot);
  // El objetivo ha llegado a la salida cuando su cifra vale N - largo
  const meta = (k: number) => Math.floor(k / pot[objetivo]) % BASE === N - piezas[objetivo].largo;
  if (meta(inicio)) return [];

  const padre = new Map<number, { previo: number; paso: Paso } | null>([[inicio, null]]);
  let frontera = [inicio];
  let final = -1;
  while (frontera.length && final < 0) {
    const siguiente: number[] = [];
    for (const k of frontera) {
      const llegado = recorrerVecinos(piezas, pot, k, (nueva, i, casillas) => {
        if (padre.has(nueva)) return;
        padre.set(nueva, { previo: k, paso: { id: piezas[i].id, casillas } });
        siguiente.push(nueva);
        if (meta(nueva)) {
          final = nueva;
          return true;
        }
      });
      if (llegado) break;
    }
    frontera = siguiente;
  }
  if (final < 0) return null;
  const camino: Paso[] = [];
  for (let e = padre.get(final); e; e = padre.get(e.previo) ?? null) camino.push(e.paso);
  return camino.reverse();
}

/** Tablero ya resuelto: la pieza objetivo en la salida y vehículos aleatorios que no se solapan */
function tableroResuelto(prng: Prng, vehiculos: readonly number[]): PiezaRushHour[] {
  const ocupadas = new Set<number>();
  const ocupar = (p: PiezaRushHour) => celdasPieza(p).forEach((c) => ocupadas.add(c.fila * N + c.col));
  const objetivo: PiezaRushHour = { id: 0, fila: FILA_SALIDA, col: N - 2, largo: 2, horizontal: true, objetivo: true };
  ocupar(objetivo);
  const piezas = [objetivo];
  const total = prng.entero(vehiculos[0], vehiculos[1]);
  for (let intento = 0; piezas.length - 1 < total && intento < 200; intento++) {
    const horizontal = prng.siguiente() < 0.5;
    const pieza: PiezaRushHour = {
      id: piezas.length,
      fila: prng.entero(0, N - 1),
      col: prng.entero(0, N - 1),
      largo: prng.siguiente() < 0.7 ? 2 : 3,
      horizontal,
      objetivo: false,
    };
    // En la fila de la salida solo se admiten vehículos verticales
    if (horizontal && pieza.fila === FILA_SALIDA) continue;
    const celdas = celdasPieza(pieza);
    if (celdas.some((c) => c.fila >= N || c.col >= N || ocupadas.has(c.fila * N + c.col))) continue;
    ocupar(pieza);
    piezas.push(pieza);
  }
  return piezas;
}

/**
 * Explora todos los tableros a los que se llega desde el resuelto (el deslizamiento es reversible,
 * así que todos son resolubles) y elige uno a la distancia deseada. La distancia es el mínimo real
 * de movimientos, porque se mide desde el conjunto de todos los tableros resueltos.
 */
function elegirTablero(
  resuelto: PiezaRushHour[],
  minimo: number,
  maximo: number,
  prng: Prng
): { piezas: PiezaRushHour[]; movs: number } {
  const n = resuelto.length;
  const pot = potencias(n);
  const salida = N - resuelto[0].largo; // cifra del objetivo cuando ha llegado a la salida

  // 1. Componente completo
  const inicio = claveDe(resuelto.map(posicion), pot);
  const visto = new Set<number>([inicio]);
  const cola = [inicio];
  for (let i = 0; i < cola.length; i++) {
    // Las disposiciones con demasiados tableros posibles son muy abiertas (fáciles) y lentas de explorar
    if (cola.length > MAX_ESTADOS) return { piezas: resuelto, movs: 0 };
    recorrerVecinos(resuelto, pot, cola[i], (nueva) => {
      if (visto.has(nueva)) return;
      visto.add(nueva);
      cola.push(nueva);
    });
  }

  // 2. Distancias desde todos los tableros resueltos a la vez
  const distancia = new Map<number, number>();
  let frontera = cola.filter((k) => Math.floor(k / pot[0]) % BASE === salida);
  frontera.forEach((k) => distancia.set(k, 0));
  const porDistancia: number[][] = [[]];
  for (let d = 1; frontera.length; d++) {
    const siguiente: number[] = [];
    for (const k of frontera) {
      recorrerVecinos(resuelto, pot, k, (nueva) => {
        if (distancia.has(nueva)) return;
        distancia.set(nueva, d);
        siguiente.push(nueva);
      });
    }
    porDistancia[d] = siguiente;
    frontera = siguiente;
  }

  // 3. Un tablero a la distancia pedida; si no hay, el más lejano que no pase del máximo
  let d = Math.min(porDistancia.length - 1, maximo);
  while (d > 0 && porDistancia[d].length === 0) d--;
  const deseadas: number[] = [];
  for (let k = minimo; k <= Math.min(maximo, porDistancia.length - 1); k++) deseadas.push(...porDistancia[k]);
  const elegida = deseadas.length ? deseadas[prng.entero(0, deseadas.length - 1)] : porDistancia[d]?.[0];
  if (elegida === undefined) return { piezas: resuelto, movs: 0 };
  const piezas = resuelto.map((p, i) => {
    const cifra = Math.floor(elegida / pot[i]) % BASE;
    return p.horizontal ? { ...p, col: cifra } : { ...p, fila: cifra };
  });
  return { piezas, movs: distancia.get(elegida)! };
}

/** Prueba varias disposiciones de vehículos y se queda con la primera que llega al mínimo del nivel (o la mejor) */
function generar(nivel: Nivel, semilla: number): PiezaRushHour[] {
  const { minMovimientos, maxMovimientos, vehiculos, intentosMax } = NIVELES.rushhour[nivel];
  const prng = crearPrng(semilla);
  let mejor: { piezas: PiezaRushHour[]; movs: number } | null = null;
  // Las disposiciones descartadas por abiertas no cuentan como intento (con un tope de seguridad)
  for (let i = 0, evaluados = 0; i < 60 && evaluados < intentosMax; i++) {
    const candidato = elegirTablero(tableroResuelto(prng, vehiculos), minMovimientos, maxMovimientos, prng);
    if (candidato.movs === 0) continue;
    evaluados++;
    if (!mejor || candidato.movs > mejor.movs) mejor = candidato;
    if (candidato.movs >= minMovimientos) break;
  }
  // Último recurso (no debería ocurrir): solo la pieza objetivo, resoluble en un movimiento
  return mejor?.piezas ?? [{ id: 0, fila: FILA_SALIDA, col: 0, largo: 2, horizontal: true, objetivo: true }];
}

function vista(nivel: Nivel, semilla: number): VistaRushHour {
  return { tipo: "rushhour", tamano: 6, salida: { fila: FILA_SALIDA }, piezas: generar(nivel, semilla) };
}

function formatoValido(respuesta: unknown): boolean {
  if (typeof respuesta !== "object" || respuesta === null) return false;
  const m = (respuesta as { movimientos?: unknown }).movimientos;
  return (
    Array.isArray(m) &&
    m.length <= MAX_MOVIMIENTOS &&
    m.every(
      (x) =>
        typeof x === "object" &&
        x !== null &&
        Number.isInteger((x as Paso).id) &&
        Number.isInteger((x as Paso).casillas)
    )
  );
}

function verificar(nivel: Nivel, semilla: number, respuesta: unknown): boolean {
  if (!formatoValido(respuesta)) return false;
  let piezas: PiezaRushHour[] | null = vista(nivel, semilla).piezas;
  for (const { id, casillas } of (respuesta as RespuestaRushHour).movimientos) {
    piezas = deslizar(piezas, id, casillas);
    if (!piezas) return false;
  }
  return rushHourResuelto(piezas);
}

export const rushhour: GeneradorMinijuego<VistaRushHour> = { vista, verificar, formatoValido };
