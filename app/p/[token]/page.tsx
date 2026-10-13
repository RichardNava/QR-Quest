import { notFound } from "next/navigation";
import FormularioContrasena from "@/components/FormularioContrasena";
import { tarjeta } from "@/components/estilos";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import type { Elemento } from "@/lib/tipos";

export const dynamic = "force-dynamic";

export default async function PaginaPuzzle({ params }: { params: { token: string } }) {
  const admin = crearClienteAdmin();
  // Nunca se selecciona `contrasena`: no debe llegar al navegador del jugador
  const { data: puzzle } = await admin
    .from("puzzles")
    .select("id, titulo")
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

  const contenido = await Promise.all(
    elementos.map(async (e) => {
      if (e.tipo === "texto") return { tipo: "texto" as const, texto: e.texto ?? "" };
      const { data: firmada } = await admin.storage.from("imagenes").createSignedUrl(e.ruta_imagen ?? "", 3600);
      return { tipo: "imagen" as const, url: firmada?.signedUrl ?? "" };
    })
  );

  return (
    <main className={`${tarjeta} space-y-4`}>
      {puzzle.titulo && <h1 className="text-2xl font-bold">{puzzle.titulo}</h1>}
      <div className="space-y-3">
        {contenido.map((c, i) =>
          c.tipo === "texto" ? (
            <p key={i} className="whitespace-pre-line text-lg">{c.texto}</p>
          ) : c.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={c.url} alt="Imagen del puzzle" className="h-auto max-w-full rounded-lg" />
          ) : null
        )}
      </div>
      <FormularioContrasena token={params.token} />
    </main>
  );
}
