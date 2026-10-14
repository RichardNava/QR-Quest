"use client";

import { useState, useTransition } from "react";
import {
  actualizarPuzzle,
  crearElemento,
  eliminarPuzzle,
  moverPuzzle,
} from "@/app/aventuras/[id]/actions";
import type { Minijuego, Vista } from "@/lib/minijuegos/tipos";
import type { Parte } from "@/lib/tipos";
import EditorElemento, { type ElementoEditable } from "./EditorElemento";
import SelectorMinijuego from "./SelectorMinijuego";
import SubidaImagen from "./SubidaImagen";
import Insignia from "./Insignia";
import { botonPeligro, botonSecundario, campo, error as estiloError, etiqueta, tarjeta, titulo2 } from "./estilos";

type Props = {
  masterId: string;
  aventuraId: string;
  puzzle: { id: string; titulo: string | null; contrasena: string; token: string };
  minijuego: Minijuego | null;
  vista: Vista | null;
  numero: number;
  esPrimero: boolean;
  esUltimo: boolean;
  enunciado: ElementoEditable[];
  recompensa: ElementoEditable[];
};

export default function EditorPuzzle(props: Props) {
  const { masterId, aventuraId, puzzle, numero, esPrimero, esUltimo } = props;
  const [titulo, setTitulo] = useState(puzzle.titulo ?? "");
  const [contrasena, setContrasena] = useState(puzzle.contrasena);
  const [mensaje, setMensaje] = useState("");
  const [pendiente, empezar] = useTransition();

  function ejecutar(accion: () => Promise<{ error?: string }>) {
    setMensaje("");
    empezar(async () => {
      const r = await accion();
      if (r.error) setMensaje(r.error);
    });
  }

  function guardarDatos() {
    if (titulo === (puzzle.titulo ?? "") && contrasena === puzzle.contrasena) return;
    ejecutar(() => actualizarPuzzle(puzzle.id, aventuraId, { titulo, contrasena }));
  }

  function seccion(parte: Parte, elementos: ElementoEditable[], rotulo: string) {
    const sinContenido = parte === "recompensa" && !elementos.some((e) => e.tipo === "imagen" || (e.texto ?? "").trim());
    return (
      <section className="space-y-2">
        <h3 className={etiqueta}>{rotulo}</h3>
        {sinContenido && (
          <p className={estiloError}>Una recompensa necesita al menos un texto o una imagen.</p>
        )}
        {elementos.map((el, i) => (
          <EditorElemento
            key={el.id}
            elemento={el}
            aventuraId={aventuraId}
            parte={parte}
            esPrimero={i === 0}
            esUltimo={i === elementos.length - 1}
          />
        ))}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pendiente}
            className={botonSecundario}
            onClick={() => ejecutar(() => crearElemento(aventuraId, { puzzleId: puzzle.id, parte, tipo: "texto", texto: "" }))}
          >
            Añadir texto
          </button>
          <SubidaImagen
            masterId={masterId}
            aventuraId={aventuraId}
            alSubir={async (ruta) => {
              const r = await crearElemento(aventuraId, { puzzleId: puzzle.id, parte, tipo: "imagen", rutaImagen: ruta });
              return r.error ?? null;
            }}
          />
        </div>
        {parte === "enunciado" && (
          <SelectorMinijuego
            puzzleId={puzzle.id}
            aventuraId={aventuraId}
            token={puzzle.token}
            minijuego={props.minijuego}
            vista={props.vista}
          />
        )}
      </section>
    );
  }

  const incompleto =
    !contrasena.trim() ||
    !props.recompensa.some((e) => e.tipo === "imagen" || (e.texto ?? "").trim());

  return (
    <article className={`${tarjeta} space-y-4 ${incompleto ? "ring-2 ring-acento" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className={titulo2}>Puzzle {numero}</h2>
          {incompleto ? (
            <Insignia variante="aviso" icono="⚠">Incompleto</Insignia>
          ) : (
            <Insignia variante="exito" icono="✓">Completo</Insignia>
          )}
        </div>
        <div className="flex gap-2">
          <button type="button" disabled={pendiente || esPrimero} onClick={() => ejecutar(() => moverPuzzle(puzzle.id, aventuraId, "subir"))} className={botonSecundario} aria-label="Subir puzzle">↑ Subir</button>
          <button type="button" disabled={pendiente || esUltimo} onClick={() => ejecutar(() => moverPuzzle(puzzle.id, aventuraId, "bajar"))} className={botonSecundario} aria-label="Bajar puzzle">↓ Bajar</button>
          <button
            type="button"
            disabled={pendiente}
            className={botonPeligro}
            onClick={() => window.confirm(`¿Eliminar el puzzle ${numero}? Su código QR dejará de funcionar.`) && ejecutar(() => eliminarPuzzle(puzzle.id, aventuraId))}
          >
            Eliminar
          </button>
        </div>
      </div>
      <label className={etiqueta}>
        Título (opcional)
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} onBlur={guardarDatos} className={campo} />
      </label>
      <label className={etiqueta}>
        Contraseña
        <input value={contrasena} onChange={(e) => setContrasena(e.target.value)} onBlur={guardarDatos} className={campo} autoComplete="off" />
      </label>
      {props.minijuego && !contrasena.trim() && (
        <p className={estiloError}>Un puzzle con minijuego necesita contraseña: es lo que el jugador obtiene al resolverlo.</p>
      )}
      {seccion("enunciado", props.enunciado, "Enunciado")}
      {seccion("recompensa", props.recompensa, esUltimo ? "Mensaje de final de la aventura" : "Recompensa")}
      {mensaje && <p className={estiloError}>{mensaje}</p>}
    </article>
  );
}
