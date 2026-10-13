"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { crearClienteNavegador } from "@/lib/supabase/cliente";
import { boton, campo, enlace, error as estiloError, tarjeta, titulo1, etiqueta } from "@/components/estilos";

export default function Restablecer() {
  const router = useRouter();
  const [estado, setEstado] = useState<"cargando" | "listo" | "invalido">("cargando");
  const [contrasena, setContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    async function preparar() {
      const supabase = crearClienteNavegador();
      const codigo = new URLSearchParams(window.location.search).get("code");
      if (codigo) {
        const { error } = await supabase.auth.exchangeCodeForSession(codigo);
        if (error) return setEstado("invalido");
        return setEstado("listo");
      }
      const { data } = await supabase.auth.getSession();
      setEstado(data.session ? "listo" : "invalido");
    }
    preparar();
  }, []);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setMensaje("");
    const supabase = crearClienteNavegador();
    const { error } = await supabase.auth.updateUser({ password: contrasena });
    if (error) {
      setMensaje("No hemos podido cambiar la contraseña. Prueba con otra de al menos 6 caracteres.");
      setEnviando(false);
      return;
    }
    router.push("/aventuras");
    router.refresh();
  }

  return (
    <main className={`${tarjeta} mx-auto max-w-md space-y-4`}>
      <h1 className={titulo1}>Nueva contraseña</h1>
      {estado === "cargando" && <p>Comprobando el enlace…</p>}
      {estado === "invalido" && (
        <p className={estiloError}>
          El enlace no es válido o ha caducado.{" "}
          <Link href="/recuperar" className={enlace}>Pide uno nuevo</Link>
        </p>
      )}
      {estado === "listo" && (
        <form onSubmit={enviar} className="space-y-3">
          <label className={etiqueta}>
            Contraseña nueva
            <input type="password" required minLength={6} value={contrasena} onChange={(e) => setContrasena(e.target.value)} className={campo} autoComplete="new-password" />
          </label>
          {mensaje && <p className={estiloError}>{mensaje}</p>}
          <button type="submit" disabled={enviando} className={`${boton} w-full`}>
            {enviando ? "Guardando…" : "Guardar contraseña"}
          </button>
        </form>
      )}
    </main>
  );
}
