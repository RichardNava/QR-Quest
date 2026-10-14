import type { Nivel, TipoMinijuego } from "./tipos";

export const NIVELES_LISTA: Nivel[] = ["facil", "medio", "dificil"];

export const NOMBRES_TIPO: Record<TipoMinijuego, string> = {
  rushhour: "Rush Hour",
  lightsout: "Lights Out",
  mastermind: "Mastermind",
  sudoku: "Sudoku",
  laberinto: "Laberinto",
};

export const NOMBRES_NIVEL: Record<Nivel, string> = {
  facil: "Fácil",
  medio: "Medio",
  dificil: "Difícil",
};

/** Tipos que ya se pueden ofrecer al master (cada tipo se añade cuando su prueba pasa) */
export const TIPOS_DISPONIBLES: TipoMinijuego[] = ["rushhour", "lightsout", "mastermind", "sudoku", "laberinto"];

export const NIVELES = {
  rushhour: {
    facil: { minMovimientos: 5, maxMovimientos: 8, vehiculos: [8, 10], intentosMax: 8 },
    medio: { minMovimientos: 8, maxMovimientos: 13, vehiculos: [9, 11], intentosMax: 16 },
    dificil: { minMovimientos: 11, maxMovimientos: 99, vehiculos: [11, 13], intentosMax: 30 },
  },
  lightsout: {
    facil: { tamano: 3, pulsaciones: 3 },
    medio: { tamano: 4, pulsaciones: 6 },
    dificil: { tamano: 5, pulsaciones: 10 },
  },
  mastermind: {
    facil: { longitud: 4, simbolos: 6, repetidos: false, intentos: 10 },
    medio: { longitud: 4, simbolos: 6, repetidos: true, intentos: 10 },
    dificil: { longitud: 5, simbolos: 8, repetidos: true, intentos: 12 },
  },
  sudoku: {
    facil: { pistas: 40 },
    medio: { pistas: 32 },
    dificil: { pistas: 26 },
  },
  laberinto: {
    facil: { ancho: 8, alto: 8 },
    medio: { ancho: 12, alto: 12 },
    dificil: { ancho: 16, alto: 16 },
  },
} as const;
