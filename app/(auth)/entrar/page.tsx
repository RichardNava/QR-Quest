"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { crearClienteNavegador } from "@/lib/supabase/cliente";
import { boton, campo, enlace, error as estiloError, tarjeta, titulo1, etiqueta, apoyo } from "@/components/estilos";

export default function Entrar() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setMensaje("");
    const supabase = crearClienteNavegador();
    const { error } = await supabase.auth.signInWithPassword({ email: correo, password: contrasena });
    if (error) {
      setMensaje("El correo o la contraseña no son correctos. Revísalos e inténtalo de nuevo.");
      setEnviando(false);
      return;
    }
    router.push("/aventuras");
    router.refresh();
  }

  return (
    <main className={`${tarjeta} mx-auto max-w-md space-y-4`}>
      <h1 className={titulo1}>Entrar</h1>
      <form onSubmit={enviar} className="space-y-3">
        <label className={etiqueta}>
          Correo electrónico
          <input type="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} className={campo} autoComplete="email" />
        </label>
        <label className={etiqueta}>
          Contraseña
          <input type="password" required value={contrasena} onChange={(e) => setContrasena(e.target.value)} className={campo} autoComplete="current-password" />
        </label>
        {mensaje && <p className={estiloError}>{mensaje}</p>}
        <button type="submit" disabled={enviando} className={`${boton} w-full`}>
          {enviando ? "Entrando…" : "Entrar"}
        </button>
      </form>
      <p className={`space-y-1 ${apoyo}`}>
        <Link href="/recuperar" className={enlace}>He olvidado mi contraseña</Link>
        <br />
        ¿No tienes cuenta? <Link href="/registro" className={enlace}>Crear cuenta</Link>
      </p>
    </main>
  );
}
