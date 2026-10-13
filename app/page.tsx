import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { boton, botonSecundario } from "@/components/estilos";

export default async function Portada() {
  const supabase = crearClienteServidor();
  const { data } = await supabase.auth.getUser();

  return (
    <main className="hero-aventura -mx-4 rounded-none px-6 pb-40 pt-14 text-center shadow-2xl shadow-noche/40 sm:mx-0 sm:rounded-3xl sm:px-12 sm:pt-20">
      <h1 className="font-titulo text-6xl font-extrabold uppercase leading-none tracking-wide text-superficie drop-shadow sm:text-8xl">
        QR <span className="text-acento">Quest</span>
      </h1>
      <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-superficie/90">
        Crea aventuras de puzzles encadenados: imprime los códigos QR, escóndelos y deja que tus
        jugadores descubran la historia con contraseñas y recompensas.
      </p>
      <div className="mt-8">
        {data.user ? (
          <Link href="/aventuras" className={`${boton} inline-flex`}>Mis aventuras</Link>
        ) : (
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/entrar" className={`${boton} inline-flex`}>Entrar</Link>
            <Link href="/registro" className={`${botonSecundario} inline-flex !border-superficie !text-superficie hover:!bg-superficie hover:!text-noche`}>
              Crear cuenta
            </Link>
          </div>
        )}
      </div>
      {/* Siluetas de montañas al pie del bloque */}
      <svg
        viewBox="0 0 800 200"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-40 w-full"
      >
        <path d="M0 200V120l90-70 70 60 110-90 120 100 90-60 100 80 90-70 130 90v110z" fill="rgb(var(--color-noche-suave))" opacity="0.55" />
        <path d="M0 200v-50l120-60 90 50 130-80 130 90 110-60 90 50 130-40v100z" fill="rgb(var(--color-noche))" />
      </svg>
    </main>
  );
}
