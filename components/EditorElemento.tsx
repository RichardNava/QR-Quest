"use client";

import { useState, useTransition } from "react";
import { actualizarElemento, eliminarElemento, moverElemento } from "@/app/aventuras/[id]/actions";
import type { Modo, Parte } from "@/lib/tipos";
import Insignia from "./Insignia";
import { botonPeligro, botonSecundario, campo, error as estiloError, etiqueta } from "./estilos";

export type ElementoEditable = {
  id: string;
  tipo: "texto" | "imagen";
  texto: string | null;
  modo: Modo;
  urlVista: string | null;
};

type Props = {
  elemento: ElementoEditable;
  aventuraId: string;
  parte: Parte;
  esPrimero: boolean;
  esUltimo: boolean;
};

export default function EditorElemento({ elemento, aventuraId, parte, esPrimero, esUltimo }: Props) {
  const [texto, setTexto] = useState(elemento.texto ?? "");
  const [mensaje, setMensaje] = useState("");
  const [pendiente, empezar] = useTransition();

  function ejecutar(accion: () => Promise<{ error?: string }>) {
    setMensaje("");
    empezar(async () => {
      const r = await accion();
      if (r.error) setMensaje(r.error);
    });
  }

  return (
    <div className="space-y-2 rounded-lg border border-borde bg-papel p-3">
      {elemento.tipo === "texto" ? (
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onBlur={() => texto !== (elemento.texto ?? "") && ejecutar(() => actualizarElemento(elemento.id, aventuraId, { texto }))}
          rows={3}
          placeholder="Escribe el texto"
          aria-label="Texto"
          className={campo}
        />
      ) : (
        <div className="space-y-2">
          {elemento.urlVista && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={elemento.urlVista} alt="Vista previa de la imagen" className="max-h-48 rounded-lg" />
          )}
          <div>
            {elemento.modo === "normal" && <Insignia variante="neutra">Normal</Insignia>}
            {elemento.modo === "difuminado" && <Insignia variante="aviso">Difuminada</Insignia>}
            {elemento.modo === "rompecabezas" && <Insignia variante="aviso">Rompecabezas</Insignia>}
          </div>
          <label className={etiqueta}>
            Cómo se muestra
            <select
              value={elemento.modo}
              onChange={(e) => ejecutar(() => actualizarElemento(elemento.id, aventuraId, { modo: e.target.value as Modo }))}
              className={campo}
            >
              <option value="normal">Normal</option>
              <option value="difuminado">Difuminado</option>
              <option value="rompecabezas">Rompecabezas</option>
            </select>
          </label>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={pendiente || esPrimero} onClick={() => ejecutar(() => moverElemento(elemento.id, aventuraId, "subir"))} className={botonSecundario} aria-label="Subir elemento">↑ Subir</button>
        <button type="button" disabled={pendiente || esUltimo} onClick={() => ejecutar(() => moverElemento(elemento.id, aventuraId, "bajar"))} className={botonSecundario} aria-label="Bajar elemento">↓ Bajar</button>
        <button type="button" disabled={pendiente} onClick={() => ejecutar(() => eliminarElemento(elemento.id, aventuraId))} className={botonPeligro}>Eliminar</button>
      </div>
      {mensaje && <p className={estiloError}>{mensaje}</p>}
    </div>
  );
}
