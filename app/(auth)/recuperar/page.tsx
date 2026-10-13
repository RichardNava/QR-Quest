"use client";

import Link from "next/link";
import { useState } from "react";
import { crearClienteNavegador } from "@/lib/supabase/cliente";
import { boton, campo, enlace, tarjeta, titulo1, etiqueta, apoyo } from "@/components/estilos";

export default function Recuperar() {
  const [correo, setCorreo] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    const supabase = crearClienteNavegador();
    await supabase.auth.resetPasswordForEmail(correo, {
      redirectTo: `${window.location.origin}/restablecer`,
    });
    // Siempre el mismo mensaje, exista o no el correo
    setEnviado(true);
    setEnviando(false);
  }

  return (
    <main className={`${tarjeta} mx-auto max-w-md space-y-4`}>
      <h1 className={titulo1}>Recuperar contraseña</h1>
      {enviado ? (
        <p className="rounded-lg border border-exito bg-exito-suave px-3 py-2 text-exito">
          Si el correo existe, te hemos enviado un enlace para elegir una contraseña nueva.
        </p>
      ) : (
        <form onSubmit={enviar} className="space-y-3">
          <label className={etiqueta}>
            Correo electrónico
            <input type="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} className={campo} autoComplete="email" />
          </label>
          <button type="submit" disabled={enviando} className={`${boton} w-full`}>
            {enviando ? "Enviando…" : "Enviar enlace"}
          </button>
        </form>
      )}
      <p className={apoyo}>
        <Link href="/entrar" className={enlace}>Volver a entrar</Link>
      </p>
    </main>
  );
}
