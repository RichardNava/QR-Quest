import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { boton, botonSecundario, titulo1 } from "@/components/estilos";

export default async function Portada() {
  const supabase = crearClienteServidor();
  const { data } = await supabase.auth.getUser();

  return (
    <main className="space-y-6 py-10 text-center">
      <h1 className={`${titulo1} text-4xl text-marca`}>QR Quest</h1>
      <p className="mx-auto max-w-md text-lg">
        Crea aventuras de puzzles encadenados: imprime los códigos QR, escóndelos y deja que tus
        jugadores descubran la historia con contraseñas y recompensas.
      </p>
      {data.user ? (
        <Link href="/aventuras" className={`${boton} inline-block`}>Mis aventuras</Link>
      ) : (
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/entrar" className={`${boton} inline-block`}>Entrar</Link>
          <Link href="/registro" className={`${botonSecundario} inline-block`}>Crear cuenta</Link>
        </div>
      )}
    </main>
  );
}
