"use client";

import { useState, useTransition } from "react";
import { crearPuzzle } from "@/app/aventuras/[id]/actions";
import { boton, error as estiloError } from "./estilos";

export default function BotonAnadirPuzzle({ aventuraId }: { aventuraId: string }) {
  const [mensaje, setMensaje] = useState("");
  const [pendiente, empezar] = useTransition();
  return (
    <div>
      <button
        type="button"
        disabled={pendiente}
        className={boton}
        onClick={() =>
          empezar(async () => {
            const r = await crearPuzzle(aventuraId);
            setMensaje(r.error ?? "");
          })
        }
      >
        Añadir puzzle
      </button>
      {mensaje && <p className={estiloError}>{mensaje}</p>}
    </div>
  );
}
