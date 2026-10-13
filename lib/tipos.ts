export type Parte = "enunciado" | "recompensa";
export type Modo = "normal" | "difuminado" | "rompecabezas";

export type Elemento = {
  id: string;
  puzzle_id: string;
  parte: Parte;
  posicion: number;
  tipo: "texto" | "imagen";
  texto: string | null;
  ruta_imagen: string | null;
  modo: Modo;
};

export type Puzzle = {
  id: string;
  aventura_id: string;
  posicion: number;
  token: string;
  titulo: string | null;
  contrasena: string;
};

export type Resultado = { error?: string };

/** Elemento listo para mostrar: las imágenes llevan un enlace firmado */
export type ElementoVista =
  | { tipo: "texto"; texto: string }
  | { tipo: "imagen"; url: string; modo: Modo };
