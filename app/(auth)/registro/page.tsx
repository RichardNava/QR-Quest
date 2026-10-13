"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { crearClienteNavegador } from "@/lib/supabase/cliente";
import { boton, campo, enlace, error as estiloError, tarjeta, titulo1, etiqueta, apoyo } from "@/components/estilos";

function traducir(mensaje: string): string {
  const m = mensaje.toLowerCase();
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Ya existe una cuenta con ese correo. Prueba a entrar.";
  if (m.includes("password")) return "La contraseña es demasiado corta (mínimo 6 caracteres).";
  if (m.includes("email")) return "Escribe un correo válido.";
  return "No hemos podido crear la cuenta. Inténtalo de nuevo.";
}

export default function Registro() {
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
    const { data, error } = await supabase.auth.signUp({ email: correo, password: contrasena });
    if (error) {
      setMensaje(traducir(error.message));
      setEnviando(false);
      return;
    }
    if (!data.session) {
      setMensaje("No hemos podido iniciar tu sesión. Prueba a entrar con tu correo.");
      setEnviando(false);
      return;
    }
    router.push("/aventuras");
    router.refresh();
  }

  return (
    <main className={`${tarjeta} mx-auto max-w-md space-y-4`}>
      <h1 className={titulo1}>Crear cuenta</h1>
      <form onSubmit={enviar} className="space-y-3">
        <label className={etiqueta}>
          Correo electrónico
          <input type="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} className={campo} autoComplete="email" />
        </label>
        <label className={etiqueta}>
          Contraseña
          <input type="password" required minLength={6} value={contrasena} onChange={(e) => setContrasena(e.target.value)} className={campo} autoComplete="new-password" />
        </label>
        {mensaje && <p className={estiloError}>{mensaje}</p>}
        <button type="submit" disabled={enviando} className={`${boton} w-full`}>
          {enviando ? "Creando…" : "Crear cuenta"}
        </button>
      </form>
      <p className={apoyo}>
        ¿Ya tienes cuenta? <Link href="/entrar" className={enlace}>Entrar</Link>
      </p>
    </main>
  );
}
