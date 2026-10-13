import Link from "next/link";
import { notFound } from "next/navigation";
import BotonAnadirPuzzle from "@/components/BotonAnadirPuzzle";
import EditorPuzzle from "@/components/EditorPuzzle";
import NombreAventura from "@/components/NombreAventura";
import { apoyo, botonSecundario } from "@/components/estilos";
import { MAX_IMAGENES_AVENTURA } from "@/lib/limites";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Elemento, Puzzle } from "@/lib/tipos";

export default async function EditorAventura({ params }: { params: { id: string } }) {
  const supabase = crearClienteServidor();
  const { data: usuario } = await supabase.auth.getUser();
  const { data: aventura } = await supabase
    .from("aventuras")
    .select("id, nombre")
    .eq("id", params.id)
    .maybeSingle();
  if (!usuario.user || !aventura) notFound();

  const { data: puzzlesDatos } = await supabase
    .from("puzzles")
    .select("*")
    .eq("aventura_id", aventura.id)
    .order("posicion");
  const puzzles = (puzzlesDatos ?? []) as Puzzle[];

  const { data: elementosDatos } = puzzles.length
    ? await supabase
        .from("elementos")
        .select("*")
        .in("puzzle_id", puzzles.map((p) => p.id))
        .order("posicion")
    : { data: [] };
  const elementos = (elementosDatos ?? []) as Elemento[];

  // Enlaces firmados para las vistas previas del editor
  const rutas = elementos.filter((e) => e.ruta_imagen).map((e) => e.ruta_imagen as string);
  const urls = new Map<string, string>();
  if (rutas.length) {
    const { data: firmadas } = await supabase.storage.from("imagenes").createSignedUrls(rutas, 3600);
    firmadas?.forEach((f) => f.path && f.signedUrl && urls.set(f.path, f.signedUrl));
  }

  const aVista = (e: Elemento) => ({
    id: e.id,
    tipo: e.tipo,
    texto: e.texto,
    modo: e.modo,
    urlVista: e.ruta_imagen ? urls.get(e.ruta_imagen) ?? null : null,
  });
  const totalImagenes = elementos.filter((e) => e.tipo === "imagen").length;

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <NombreAventura id={aventura.id} nombre={aventura.nombre} />
        <Link href={`/aventuras/${aventura.id}/rejilla`} className={botonSecundario}>Imprimir rejilla</Link>
      </div>
      <p className={apoyo}>
        {totalImagenes} de {MAX_IMAGENES_AVENTURA} imágenes
      </p>
      {puzzles.map((p, i) => (
        <EditorPuzzle
          key={p.id}
          masterId={usuario.user!.id}
          aventuraId={aventura.id}
          puzzle={{ id: p.id, titulo: p.titulo, contrasena: p.contrasena }}
          numero={i + 1}
          esPrimero={i === 0}
          esUltimo={i === puzzles.length - 1}
          enunciado={elementos.filter((e) => e.puzzle_id === p.id && e.parte === "enunciado").map(aVista)}
          recompensa={elementos.filter((e) => e.puzzle_id === p.id && e.parte === "recompensa").map(aVista)}
        />
      ))}
      <BotonAnadirPuzzle aventuraId={aventura.id} />
    </main>
  );
}
