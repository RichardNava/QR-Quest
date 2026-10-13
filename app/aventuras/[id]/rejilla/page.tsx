import Link from "next/link";
import { notFound } from "next/navigation";
import RejillaQR from "@/components/RejillaQR";
import { enlace } from "@/components/estilos";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export default async function Rejilla({ params }: { params: { id: string } }) {
  const supabase = crearClienteServidor();
  const { data: aventura } = await supabase
    .from("aventuras")
    .select("id, nombre")
    .eq("id", params.id)
    .maybeSingle();
  if (!aventura) notFound();

  const { data: puzzles } = await supabase
    .from("puzzles")
    .select("id, token, contrasena, elementos(parte, tipo, texto)")
    .eq("aventura_id", aventura.id)
    .order("posicion");

  const lista = puzzles ?? [];
  const problemas: string[] = [];
  if (lista.length === 0) problemas.push("La aventura todavía no tiene ningún puzzle.");
  lista.forEach((p, i) => {
    if (!p.contrasena.trim()) problemas.push(`El puzzle ${i + 1} no tiene contraseña.`);
    const elementos = p.elementos as { parte: string; tipo: string; texto: string | null }[];
    const hayRecompensa = elementos.some(
      (e) => e.parte === "recompensa" && (e.tipo === "imagen" || (e.texto ?? "").trim())
    );
    if (!hayRecompensa) problemas.push(`La recompensa del puzzle ${i + 1} necesita al menos un texto o una imagen.`);
  });

  return (
    <main className="space-y-4">
      <h1 className="no-imprimir text-2xl font-bold">Rejilla de QR · {aventura.nombre}</h1>
      {problemas.length > 0 ? (
        <div className="space-y-2 rounded-lg bg-red-50 p-4 text-red-800">
          <p className="font-medium">No se puede generar la rejilla todavía:</p>
          <ul className="list-disc pl-5">
            {problemas.map((m) => <li key={m}>{m}</li>)}
          </ul>
          <Link href={`/aventuras/${aventura.id}`} className={enlace}>Volver al editor</Link>
        </div>
      ) : (
        <RejillaQR
          nombreAventura={aventura.nombre}
          puzzles={lista.map((p, i) => ({ token: p.token, numero: i + 1 }))}
        />
      )}
    </main>
  );
}
