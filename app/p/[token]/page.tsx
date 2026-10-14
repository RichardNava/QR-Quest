import { notFound } from "next/navigation";
import FormularioContrasena from "@/components/FormularioContrasena";
import ContenidoPuzzle from "@/components/ContenidoPuzzle";
import Minijuego from "@/components/minijuegos/Minijuego";
import { tarjeta, titulo1 } from "@/components/estilos";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { generarVista, leerMinijuego } from "@/lib/minijuegos";
import type { Elemento, ElementoVista } from "@/lib/tipos";

export const dynamic = "force-dynamic";

export default async function PaginaPuzzle({ params }: { params: { token: string } }) {
  const admin = crearClienteAdmin();
  // Nunca se selecciona `contrasena`: no debe llegar al navegador del jugador
  const { data: puzzle } = await admin
    .from("puzzles")
    .select("id, titulo, minijuego, clave_numerica, longitud_clave")
    .eq("token", params.token)
    .maybeSingle();
  if (!puzzle) notFound();

  const { data } = await admin
    .from("elementos")
    .select("*")
    .eq("puzzle_id", puzzle.id)
    .eq("parte", "enunciado")
    .order("posicion");
  const elementos = (data ?? []) as Elemento[];

  const contenido = (
    await Promise.all(
      elementos.map(async (e): Promise<ElementoVista | null> => {
        if (e.tipo === "texto") return { tipo: "texto", texto: e.texto ?? "" };
        const { data: firmada } = await admin.storage.from("imagenes").createSignedUrl(e.ruta_imagen ?? "", 3600);
        return firmada?.signedUrl ? { tipo: "imagen", url: firmada.signedUrl, modo: e.modo } : null;
      })
    )
  ).filter((c): c is ElementoVista => c !== null);

  // La vista se calcula aquí: el navegador nunca recibe la receta del tablero, la solución ni la contraseña
  const minijuego = leerMinijuego(puzzle.minijuego);

  return (
    <main className={`${tarjeta} space-y-4`}>
      {puzzle.titulo && <h1 className={titulo1}>{puzzle.titulo}</h1>}
      <ContenidoPuzzle elementos={contenido} textosSiempreVisibles />
      {minijuego && (
        <Minijuego tipo={minijuego.tipo} nivel={minijuego.nivel} vista={generarVista(minijuego)} token={params.token} />
      )}
      <FormularioContrasena token={params.token} casillas={puzzle.clave_numerica ? puzzle.longitud_clave : null} />
    </main>
  );
}
