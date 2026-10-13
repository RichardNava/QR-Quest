"use server";

import { normalizar } from "@/lib/normalizar";
import { crearClienteAdmin } from "@/lib/supabase/admin";
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
