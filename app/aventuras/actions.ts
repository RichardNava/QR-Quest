"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export async function crearAventura(
  nombre: string
): Promise<{ error?: string; id?: string }> {
  if (!nombre.trim()) return { error: "Escribe un nombre para la aventura." };
  const supabase = crearClienteServidor();
  const { data: usuario } = await supabase.auth.getUser();
  if (!usuario.user) return { error: "Tu sesión ha caducado. Vuelve a entrar." };
  const { data, error } = await supabase
    .from("aventuras")
    .insert({ nombre: nombre.trim(), master_id: usuario.user.id })
    .select("id")
    .single();
  if (error) return { error: "No hemos podido crear la aventura. Inténtalo de nuevo." };
  revalidatePath("/aventuras");
  return { id: data.id };
}

export async function eliminarAventura(id: string): Promise<{ error?: string }> {
  const supabase = crearClienteServidor();
  const { data: usuario } = await supabase.auth.getUser();
  if (!usuario.user) return { error: "Tu sesión ha caducado. Vuelve a entrar." };

  // Primero los archivos de imagen de la aventura
  const carpeta = `${usuario.user.id}/${id}`;
  const { data: archivos } = await supabase.storage.from("imagenes").list(carpeta, { limit: 1000 });
  if (archivos && archivos.length > 0) {
    await supabase.storage.from("imagenes").remove(archivos.map((a) => `${carpeta}/${a.name}`));
  }

  const { error } = await supabase.from("aventuras").delete().eq("id", id);
  if (error) return { error: "No hemos podido eliminar la aventura." };
  revalidatePath("/aventuras");
  return {};
}
