"use server";

import { normalizar } from "@/lib/normalizar";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { formatoValido, leerMinijuego, pistasMastermind, verificarRespuesta } from "@/lib/minijuegos";
import type { PistasMastermind } from "@/lib/minijuegos/tipos";
import type { Elemento, ElementoVista } from "@/lib/tipos";

export type RespuestaContrasena =
  | { ok: true; recompensa: ElementoVista[]; esFinal: boolean }
  | { ok: false; mensaje: string };

const NO_EXISTE = "Este puzzle ya no existe.";

export async function comprobarContrasena(token: string, intento: string): Promise<RespuestaContrasena> {
  const admin = crearClienteAdmin();
  const { data: puzzle } = await admin
    .from("puzzles")
    .select("id, aventura_id, posicion, contrasena")
    .eq("token", token)
    .maybeSingle();
  if (!puzzle) return { ok: false, mensaje: NO_EXISTE };

  if (normalizar(intento) !== normalizar(puzzle.contrasena)) {
    return { ok: false, mensaje: "Esa no es la contraseña. ¡Inténtalo de nuevo!" };
  }

  const { data } = await admin
    .from("elementos")
    .select("*")
    .eq("puzzle_id", puzzle.id)
    .eq("parte", "recompensa")
    .order("posicion");
  const elementos = (data ?? []) as Elemento[];

  const recompensa: ElementoVista[] = [];
  for (const e of elementos) {
    if (e.tipo === "texto") {
      recompensa.push({ tipo: "texto", texto: e.texto ?? "" });
    } else if (e.ruta_imagen) {
      const { data: firmada } = await admin.storage.from("imagenes").createSignedUrl(e.ruta_imagen, 3600);
      if (firmada?.signedUrl) recompensa.push({ tipo: "imagen", url: firmada.signedUrl, modo: e.modo });
    }
  }

  // El último puzzle (mayor posición) es el mensaje de final
  const { data: posteriores } = await admin
    .from("puzzles")
    .select("id")
    .eq("aventura_id", puzzle.aventura_id)
    .gt("posicion", puzzle.posicion)
    .limit(1);
  const esFinal = (posteriores ?? []).length === 0;

  return { ok: true, recompensa, esFinal };
}

export type RespuestaMinijuego = { ok: true; contrasena: string } | { ok: false; mensaje: string };

export type RespuestaCodigo =
  | { ok: true; resuelto: false; pistas: PistasMastermind }
  | { ok: true; resuelto: true; contrasena: string }
  | { ok: false; mensaje: string };

async function cargarMinijuego(token: string) {
  const admin = crearClienteAdmin();
  const { data: puzzle } = await admin
    .from("puzzles")
    .select("contrasena, minijuego")
    .eq("token", token)
    .maybeSingle();
  if (!puzzle) return { ok: false, mensaje: NO_EXISTE } as const;
  const minijuego = leerMinijuego(puzzle.minijuego);
  return { ok: true, minijuego, contrasena: puzzle.contrasena as string } as const;
}

/**
 * Comprueba la solución de un minijuego (todos menos Mastermind). Solo si el servidor la da por
 * buena devuelve la contraseña: el navegador nunca la recibe antes.
 */
export async function resolverMinijuego(token: string, respuesta: unknown): Promise<RespuestaMinijuego> {
  try {
    const datos = await cargarMinijuego(token);
    if (!datos.ok) return datos;
    const { minijuego, contrasena } = datos;
    if (!minijuego || minijuego.tipo === "mastermind") return { ok: false, mensaje: "Este puzzle no se resuelve así." };
    if (!formatoValido(minijuego, respuesta)) return { ok: false, mensaje: "La solución no es válida." };
    if (!verificarRespuesta(minijuego, respuesta)) return { ok: false, mensaje: "Todavía no está resuelto." };
    return { ok: true, contrasena };
  } catch {
    return { ok: false, mensaje: "La solución no es válida." };
  }
}

/** Mastermind: cada intento se comprueba aquí porque el código secreto no puede salir del servidor */
export async function probarCodigo(token: string, codigo: unknown): Promise<RespuestaCodigo> {
  try {
    const datos = await cargarMinijuego(token);
    if (!datos.ok) return datos;
    const { minijuego, contrasena } = datos;
    if (!minijuego || minijuego.tipo !== "mastermind") return { ok: false, mensaje: "Este puzzle no se resuelve así." };
    const pistas = pistasMastermind(minijuego, codigo);
    if (!pistas) return { ok: false, mensaje: "La combinación no es válida." };
    if (verificarRespuesta(minijuego, { codigo })) return { ok: true, resuelto: true, contrasena };
    return { ok: true, resuelto: false, pistas };
  } catch {
    return { ok: false, mensaje: "La combinación no es válida." };
  }
}
