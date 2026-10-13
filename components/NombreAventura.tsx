"use client";

import { useState, useTransition } from "react";
import { renombrarAventura } from "@/app/aventuras/[id]/actions";
import { campo, error as estiloError } from "./estilos";

export default function NombreAventura({ id, nombre }: { id: string; nombre: string }) {
  const [valor, setValor] = useState(nombre);
  const [mensaje, setMensaje] = useState("");
  const [, empezar] = useTransition();

  function guardar() {
    if (valor === nombre) return;
    empezar(async () => {
      const r = await renombrarAventura(id, valor);
      setMensaje(r.error ?? "");
      if (r.error) setValor(nombre);
    });
  }

  return (
    <div className="flex-1">
      <input
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        onBlur={guardar}
        aria-label="Nombre de la aventura"
        className={`${campo} text-xl font-bold`}
      />
      {mensaje && <p className={estiloError}>{mensaje}</p>}
    </div>
  );
}
