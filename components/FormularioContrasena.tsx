"use client";

import { useState, useTransition } from "react";
import { comprobarContrasena } from "@/app/p/[token]/actions";
import type { ElementoVista } from "@/lib/tipos";
import ContenidoPuzzle from "./ContenidoPuzzle";
import { boton, campo, error as estiloError } from "./estilos";

export default function FormularioContrasena({ token }: { token: string }) {
  const [intento, setIntento] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [premio, setPremio] = useState<{ elementos: ElementoVista[]; esFinal: boolean } | null>(null);
  const [pendiente, empezar] = useTransition();

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setMensaje("");
    empezar(async () => {
      const r = await comprobarContrasena(token, intento);
      if (r.ok) setPremio({ elementos: r.recompensa, esFinal: r.esFinal });
      else setMensaje(r.mensaje);
    });
  }

  if (premio) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-green-700">
          {premio.esFinal ? "¡Fin de la aventura!" : "¡Correcto!"}
        </h2>
        <ContenidoPuzzle elementos={premio.elementos} />
      </section>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <label className="block font-medium">
        Contraseña
        <input value={intento} onChange={(e) => setIntento(e.target.value)} className={campo} autoComplete="off" autoCapitalize="off" />
      </label>
      {mensaje && <p className={estiloError}>{mensaje}</p>}
      <button type="submit" disabled={pendiente || !intento.trim()} className={`${boton} w-full`}>
        {pendiente ? "Comprobando…" : "Comprobar"}
      </button>
    </form>
  );
}
