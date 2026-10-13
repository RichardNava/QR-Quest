"use client";

import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/cliente";
import { botonSecundario } from "./estilos";

export default function CerrarSesion() {
  const router = useRouter();
  async function salir() {
    await crearClienteNavegador().auth.signOut();
    router.push("/");
    router.refresh();
  }
  return (
    <button onClick={salir} className={botonSecundario}>
      Cerrar sesión
    </button>
  );
}
