"use client";

import { useState, useTransition } from "react";
import { comprobarContrasena } from "@/app/p/[token]/actions";
import type { ElementoVista } from "@/lib/tipos";
import ContenidoPuzzle from "./ContenidoPuzzle";
import CasillasDigitos from "./CasillasDigitos";
import { aviso, boton, campo, etiqueta, titulo2 } from "./estilos";

export default function FormularioContrasena({ token, casillas }: { token: string; casillas: number | null }) {
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
        <h2 className={`${titulo2} text-2xl text-exito`}>
          <span aria-hidden="true">✓ </span>
          {premio.esFinal ? "¡Fin de la aventura!" : "¡Correcto!"}
        </h2>
        <div className="rounded-lg border border-exito bg-exito-suave p-4">
          <ContenidoPuzzle elementos={premio.elementos} />
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      {casillas ? (
        <div className="space-y-1">
          <p className={etiqueta}>Contraseña ({casillas} dígitos)</p>
          <CasillasDigitos longitud={casillas} valor={intento} alCambiar={setIntento} />
        </div>
      ) : (
        <label className={etiqueta}>
          Contraseña
          <input value={intento} onChange={(e) => setIntento(e.target.value)} className={campo} autoComplete="off" autoCapitalize="off" />
        </label>
      )}
      {mensaje && (
        <p className={aviso} role="alert">
          <span aria-hidden="true">✕ </span>
          {mensaje}
        </p>
      )}
      <button type="submit" disabled={pendiente || (casillas ? intento.length < casillas : !intento.trim())} className={`${boton} w-full`}>
        {pendiente ? "Comprobando…" : "Comprobar"}
      </button>
    </form>
  );
}
