"use client";

import { useState, useTransition } from "react";
import { guardarMinijuego, quitarMinijuego } from "@/app/aventuras/[id]/actions";
import { NIVELES_LISTA, NOMBRES_NIVEL, NOMBRES_TIPO, TIPOS_DISPONIBLES } from "@/lib/minijuegos/config";
import type { Minijuego as TipoGuardado, Nivel, TipoMinijuego, Vista } from "@/lib/minijuegos/tipos";
import Minijuego from "./minijuegos/Minijuego";
import { botonPeligro, botonSecundario, campo, error as estiloError, etiqueta } from "./estilos";

type Props = {
  puzzleId: string;
  aventuraId: string;
  token: string;
  minijuego: TipoGuardado | null;
  vista: Vista | null;
};

export default function SelectorMinijuego({ puzzleId, aventuraId, token, minijuego, vista }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [tipo, setTipo] = useState<TipoMinijuego>(minijuego?.tipo ?? TIPOS_DISPONIBLES[0]);
  const [nivel, setNivel] = useState<Nivel>(minijuego?.nivel ?? "facil");
  const [mensaje, setMensaje] = useState("");
  const [pendiente, empezar] = useTransition();

  function ejecutar(accion: () => Promise<{ error?: string }>, alAcabar?: () => void) {
    setMensaje("");
    empezar(async () => {
      const r = await accion();
      if (r.error) setMensaje(r.error);
      else alAcabar?.();
    });
  }

  const selectores = (
    <div className="flex flex-wrap items-end gap-2">
      <label className={`${etiqueta} min-w-[8rem] flex-1`}>
        Tipo
        <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoMinijuego)} className={campo}>
          {TIPOS_DISPONIBLES.map((t) => (
            <option key={t} value={t}>{NOMBRES_TIPO[t]}</option>
          ))}
        </select>
      </label>
      <label className={`${etiqueta} min-w-[8rem] flex-1`}>
        Dificultad
        <select value={nivel} onChange={(e) => setNivel(e.target.value as Nivel)} className={campo}>
          {NIVELES_LISTA.map((n) => (
            <option key={n} value={n}>{NOMBRES_NIVEL[n]}</option>
          ))}
        </select>
      </label>
    </div>
  );

  if (!minijuego || !vista) {
    return (
      <div className="space-y-2">
        {!abierto ? (
          <button type="button" className={botonSecundario} onClick={() => setAbierto(true)}>
            Añadir minijuego
          </button>
        ) : (
          <div className="space-y-2 rounded-lg border border-borde bg-papel p-3">
            {selectores}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pendiente}
                className={botonSecundario}
                onClick={() => ejecutar(() => guardarMinijuego(puzzleId, aventuraId, tipo, nivel), () => setAbierto(false))}
              >
                {pendiente ? "Generando…" : "Generar"}
              </button>
              <button type="button" disabled={pendiente} className={botonSecundario} onClick={() => setAbierto(false)}>
                Cancelar
              </button>
            </div>
          </div>
        )}
        {mensaje && <p className={estiloError}>{mensaje}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-borde bg-superficie p-3">
      <p className={etiqueta}>Minijuego del puzzle (vista previa)</p>
      {/* La clave fuerza un tablero nuevo cuando se regenera */}
      <Minijuego key={JSON.stringify(vista)} tipo={minijuego.tipo} nivel={minijuego.nivel} vista={vista} token={token} />
      {selectores}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pendiente}
          className={botonSecundario}
          onClick={() => ejecutar(() => guardarMinijuego(puzzleId, aventuraId, tipo, nivel))}
        >
          {pendiente ? "Generando…" : tipo === minijuego.tipo && nivel === minijuego.nivel ? "Generar de nuevo" : "Generar con estos ajustes"}
        </button>
        <button
          type="button"
          disabled={pendiente}
          className={botonPeligro}
          onClick={() => window.confirm("¿Quitar el minijuego de este puzzle?") && ejecutar(() => quitarMinijuego(puzzleId, aventuraId))}
        >
          Quitar minijuego
        </button>
      </div>
      {mensaje && <p className={estiloError}>{mensaje}</p>}
    </div>
  );
}
