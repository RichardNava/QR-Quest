"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Modo, Parte, Resultado } from "@/lib/tipos";

const MSG_LIMITE = "Esta aventura ya tiene 40 imágenes, el máximo permitido.";
const MSG_GENERICO = "No hemos podido guardar los cambios. Inténtalo de nuevo.";

function refrescar(aventuraId: string) {
  revalidatePath(`/aventuras/${aventuraId}`);
}

function traducirError(mensaje: string): string {
  return mensaje.includes("Máximo 40 imágenes") ? MSG_LIMITE : MSG_GENERICO;
}

export async function renombrarAventura(id: string, nombre: string): Promise<Resultado> {
  if (!nombre.trim()) return { error: "El nombre no puede estar vacío." };
  const supabase = crearClienteServidor();
  const { error } = await supabase.from("aventuras").update({ nombre: nombre.trim() }).eq("id", id);
  if (error) return { error: MSG_GENERICO };
  refrescar(id);
  return {};
}

export async function crearPuzzle(aventuraId: string): Promise<Resultado> {
  const supabase = crearClienteServidor();
  const { data: ultimo } = await supabase
    .from("puzzles")
    .select("posicion")
    .eq("aventura_id", aventuraId)
    .order("posicion", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { error } = await supabase
    .from("puzzles")
    .insert({ aventura_id: aventuraId, posicion: (ultimo?.posicion ?? 0) + 1 });
  if (error) return { error: MSG_GENERICO };
  refrescar(aventuraId);
  return {};
}

export async function actualizarPuzzle(
  id: string,
  aventuraId: string,
  datos: { titulo: string; contrasena: string }
): Promise<Resultado> {
  const supabase = crearClienteServidor();
  const { error } = await supabase
    .from("puzzles")
    .update({ titulo: datos.titulo.trim() || null, contrasena: datos.contrasena })
    .eq("id", id);
  if (error) return { error: MSG_GENERICO };
  refrescar(aventuraId);
  return {};
}

async function borrarArchivos(rutas: (string | null)[]) {
  const validas = rutas.filter((r): r is string => !!r);
  if (validas.length === 0) return;
  const supabase = crearClienteServidor();
  await supabase.storage.from("imagenes").remove(validas);
}

export async function eliminarPuzzle(id: string, aventuraId: string): Promise<Resultado> {
  const supabase = crearClienteServidor();
  const { data: elementos } = await supabase
    .from("elementos")
    .select("ruta_imagen")
    .eq("puzzle_id", id)
    .eq("tipo", "imagen");
  await borrarArchivos((elementos ?? []).map((e) => e.ruta_imagen));
  const { error } = await supabase.from("puzzles").delete().eq("id", id);
  if (error) return { error: MSG_GENERICO };
  refrescar(aventuraId);
  return {};
}

/** Intercambia `posicion` con el vecino. Nunca toca `token` (RF-009). */
export async function moverPuzzle(
  id: string,
  aventuraId: string,
  direccion: "subir" | "bajar"
): Promise<Resultado> {
  const supabase = crearClienteServidor();
  const { data: puzzles } = await supabase
    .from("puzzles")
    .select("id, posicion")
    .eq("aventura_id", aventuraId)
    .order("posicion");
  if (!puzzles) return { error: MSG_GENERICO };
  const i = puzzles.findIndex((p) => p.id === id);
  const j = direccion === "subir" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= puzzles.length) return {};
  const a = puzzles[i];
  const b = puzzles[j];
  const r1 = await supabase.from("puzzles").update({ posicion: b.posicion }).eq("id", a.id);
  const r2 = await supabase.from("puzzles").update({ posicion: a.posicion }).eq("id", b.id);
  if (r1.error || r2.error) return { error: MSG_GENERICO };
  refrescar(aventuraId);
  return {};
}

export async function crearElemento(
  aventuraId: string,
  datos: {
    puzzleId: string;
    parte: Parte;
    tipo: "texto" | "imagen";
    texto?: string;
    rutaImagen?: string;
  }
): Promise<Resultado> {
  const supabase = crearClienteServidor();
  const { data: ultimo } = await supabase
    .from("elementos")
    .select("posicion")
    .eq("puzzle_id", datos.puzzleId)
    .eq("parte", datos.parte)
    .order("posicion", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { error } = await supabase.from("elementos").insert({
    puzzle_id: datos.puzzleId,
    parte: datos.parte,
    posicion: (ultimo?.posicion ?? 0) + 1,
    tipo: datos.tipo,
    texto: datos.tipo === "texto" ? datos.texto ?? "" : null,
    ruta_imagen: datos.tipo === "imagen" ? datos.rutaImagen ?? null : null,
  });
  if (error) {
    if (datos.tipo === "imagen") await borrarArchivos([datos.rutaImagen ?? null]);
    return { error: traducirError(error.message) };
  }
  refrescar(aventuraId);
  return {};
}

export async function actualizarElemento(
  id: string,
  aventuraId: string,
  cambios: { texto?: string; modo?: Modo }
): Promise<Resultado> {
  const supabase = crearClienteServidor();
  const { error } = await supabase.from("elementos").update(cambios).eq("id", id);
  if (error) return { error: traducirError(error.message) };
  refrescar(aventuraId);
  return {};
}

export async function eliminarElemento(id: string, aventuraId: string): Promise<Resultado> {
  const supabase = crearClienteServidor();
  const { data: elemento } = await supabase
    .from("elementos")
    .select("ruta_imagen")
    .eq("id", id)
    .maybeSingle();
  await borrarArchivos([elemento?.ruta_imagen ?? null]);
  const { error } = await supabase.from("elementos").delete().eq("id", id);
  if (error) return { error: MSG_GENERICO };
  refrescar(aventuraId);
  return {};
}

export async function moverElemento(
  id: string,
  aventuraId: string,
  direccion: "subir" | "bajar"
): Promise<Resultado> {
  const supabase = crearClienteServidor();
  const { data: actual } = await supabase
    .from("elementos")
    .select("id, puzzle_id, parte, posicion")
    .eq("id", id)
    .maybeSingle();
  if (!actual) return { error: MSG_GENERICO };
  const { data: hermanos } = await supabase
    .from("elementos")
    .select("id, posicion")
    .eq("puzzle_id", actual.puzzle_id)
    .eq("parte", actual.parte)
    .order("posicion");
  if (!hermanos) return { error: MSG_GENERICO };
  const i = hermanos.findIndex((h) => h.id === id);
  const j = direccion === "subir" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= hermanos.length) return {};
  const r1 = await supabase.from("elementos").update({ posicion: hermanos[j].posicion }).eq("id", hermanos[i].id);
  const r2 = await supabase.from("elementos").update({ posicion: hermanos[i].posicion }).eq("id", hermanos[j].id);
  if (r1.error || r2.error) return { error: MSG_GENERICO };
  refrescar(aventuraId);
  return {};
}
