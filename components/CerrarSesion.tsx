"use client";

import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/cliente";

export default function CerrarSesion() {
  const router = useRouter();
  async function salir() {
    await crearClienteNavegador().auth.signOut();
    router.push("/");
    router.refresh();
  }
  return (
    <button onClick={salir} className="inline-flex min-h-[44px] items-center justify-center rounded-lg border-2 border-superficie/70 bg-transparent px-3 py-2 font-titulo text-base font-bold uppercase tracking-wider text-superficie transition hover:border-acento hover:bg-acento hover:text-noche focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acento">
      Cerrar sesión
    </button>
  );
}
