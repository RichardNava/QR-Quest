import ListaAventuras from "@/components/ListaAventuras";
import { titulo1 } from "@/components/estilos";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export default async function MisAventuras() {
  const supabase = crearClienteServidor();
  const { data } = await supabase
    .from("aventuras")
    .select("id, nombre, creada_en, puzzles(count)")
    .order("creada_en", { ascending: false });

  const aventuras = (data ?? []).map((a) => ({
    id: a.id as string,
    nombre: a.nombre as string,
    creada_en: a.creada_en as string,
    puzzles: (a.puzzles as unknown as { count: number }[])?.[0]?.count ?? 0,
  }));

  return (
    <main className="space-y-6">
      <h1 className={titulo1}>Mis aventuras</h1>
      <ListaAventuras aventuras={aventuras} />
    </main>
  );
}
