// Tipos compartidos de los minijuegos. Sin lógica: se pueden importar desde el navegador.
export type Nivel = "facil" | "medio" | "dificil";
export type TipoMinijuego = "rushhour" | "lightsout" | "mastermind" | "sudoku" | "laberinto";

/** Lo que se guarda en `puzzles.minijuego`: la «receta» del tablero */
export type Minijuego = { tipo: TipoMinijuego; nivel: Nivel; semilla: number };

export type Posicion = { fila: number; col: number };

// Rush Hour
export type PiezaRushHour = {
  id: number;
  fila: number;
  col: number;
  largo: 2 | 3;
  horizontal: boolean;
  objetivo: boolean;
};
export type VistaRushHour = { tipo: "rushhour"; tamano: 6; salida: { fila: number }; piezas: PiezaRushHour[] };
/** `casillas` con signo: + derecha/abajo, − izquierda/arriba */
export type RespuestaRushHour = { movimientos: { id: number; casillas: number }[] };

// Lights Out
export type VistaLightsOut = { tipo: "lightsout"; tamano: 3 | 4 | 5; encendidas: boolean[][] };
export type RespuestaLightsOut = { pulsadas: Posicion[] };

// Mastermind
export type VistaMastermind = {
  tipo: "mastermind";
  longitud: 4 | 5;
  simbolos: number;
  intentos: number;
  repetidos: boolean;
};
export type IntentoMastermind = { codigo: number[] };
export type PistasMastermind = { enSuSitio: number; enOtroSitio: number };

// Sudoku
export type VistaSudoku = { tipo: "sudoku"; casillas: (number | null)[][] };
export type RespuestaSudoku = { casillas: number[][] };

// Laberinto
export type Direccion = "N" | "S" | "E" | "O";
export type VistaLaberinto = {
  tipo: "laberinto";
  ancho: number;
  alto: number;
  /** derecha[f][c]: hay pared entre (f,c) y (f,c+1) · abajo[f][c]: hay pared entre (f,c) y (f+1,c) */
  paredes: { derecha: boolean[][]; abajo: boolean[][] };
  inicio: Posicion;
  meta: Posicion;
};
export type RespuestaLaberinto = { movimientos: Direccion[] };

export type Vista = VistaRushHour | VistaLightsOut | VistaMastermind | VistaSudoku | VistaLaberinto;
export type Respuesta = RespuestaRushHour | RespuestaLightsOut | RespuestaSudoku | RespuestaLaberinto;

/** Forma común de los módulos generadores (solo servidor) */
export type GeneradorMinijuego<V extends Vista = Vista> = {
  vista(nivel: Nivel, semilla: number): V;
  verificar(nivel: Nivel, semilla: number, respuesta: unknown): boolean;
  /** ¿tiene la respuesta la forma y los límites esperados? */
  formatoValido(respuesta: unknown): boolean;
};
