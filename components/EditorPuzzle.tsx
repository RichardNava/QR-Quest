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
import { apoyo, botonAnadir, botonPeligro, botonSecundario, campo, error as estiloError, etiqueta, tarjeta } from "./estilos";

const soloDigitos = (texto: string) => texto.replace(/\D/g, "");

type Props = {
  masterId: string;
  aventuraId: string;
  puzzle: { id: string; titulo: string | null; contrasena: string; numerica: boolean; token: string };
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
  const [numerica, setNumerica] = useState(puzzle.numerica);
  const [abrirMinijuego, setAbrirMinijuego] = useState(false);
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
    ejecutar(() => actualizarPuzzle(puzzle.id, aventuraId, { titulo, contrasena, numerica }));
  }

  function cambiarTipoClave(esNumerica: boolean) {
    const nueva = esNumerica ? soloDigitos(contrasena) : contrasena;
    setNumerica(esNumerica);
    setContrasena(nueva);
    ejecutar(() => actualizarPuzzle(puzzle.id, aventuraId, { titulo, contrasena: nueva, numerica: esNumerica }));
  }

  function seccion(parte: Parte, elementos: ElementoEditable[]) {
    const esEnunciado = parte === "enunciado";
    const sinContenido = !esEnunciado && !elementos.some((e) => e.tipo === "imagen" || (e.texto ?? "").trim());
    const rotulo = esEnunciado ? "Enunciado" : esUltimo ? "Mensaje de final de la aventura" : "Recompensa";
    const subtitulo = esEnunciado ? "Lo que ve el jugador al escanear el QR" : "Lo que descubre al acertar la contraseña";
    const estilo = esEnunciado
      ? { caja: "border-acento bg-acento-suave/40", banda: "bg-acento text-noche", icono: "?" }
      : { caja: "border-exito bg-exito-suave/60", banda: "bg-exito text-superficie", icono: "★" };
    return (
      <section className={`overflow-hidden rounded-xl border-2 ${estilo.caja}`}>
        <header className={`flex flex-wrap items-center gap-x-3 gap-y-0 px-3 py-2 ${estilo.banda}`}>
          <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-full bg-noche/20 font-titulo text-lg font-extrabold leading-none">
            {estilo.icono}
          </span>
          <h3 className="font-titulo text-xl font-extrabold uppercase tracking-wider">{rotulo}</h3>
          <p className="text-sm font-medium opacity-90">{subtitulo}</p>
        </header>
        <div className="space-y-2 p-3">
          {sinContenido && <p className={estiloError}>Una recompensa necesita al menos un texto o una imagen.</p>}
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
              className={botonAnadir}
              onClick={() => ejecutar(() => crearElemento(aventuraId, { puzzleId: puzzle.id, parte, tipo: "texto", texto: "" }))}
            >
              + Añadir texto
            </button>
            <SubidaImagen
              masterId={masterId}
              aventuraId={aventuraId}
              alSubir={async (ruta) => {
                const r = await crearElemento(aventuraId, { puzzleId: puzzle.id, parte, tipo: "imagen", rutaImagen: ruta });
                return r.error ?? null;
              }}
            />
            {esEnunciado && !props.minijuego && (
              <button type="button" className={botonAnadir} onClick={() => setAbrirMinijuego(true)}>
                + Añadir minijuego
              </button>
            )}
          </div>
          {esEnunciado && (
            <SelectorMinijuego
              puzzleId={puzzle.id}
              aventuraId={aventuraId}
              token={puzzle.token}
              minijuego={props.minijuego}
              vista={props.vista}
              abierto={abrirMinijuego}
              alCerrar={() => setAbrirMinijuego(false)}
            />
          )}
        </div>
      </section>
    );
  }

  const incompleto =
    !contrasena.trim() ||
    !props.recompensa.some((e) => e.tipo === "imagen" || (e.texto ?? "").trim());

  return (
    <article className={`${tarjeta} space-y-4 ${incompleto ? "ring-2 ring-acento" : ""}`}>
      {/* Barra pegajosa: el master siempre ve en qué puzzle está trabajando */}
      <div className="sticky top-[var(--altura-cabecera,3rem)] z-30 -mx-5 -mt-5 flex items-center gap-2 rounded-t-xl border-b-2 border-borde bg-superficie px-5 py-2 shadow-md shadow-noche/10">
        <span
          className="grid h-10 min-w-[2.5rem] shrink-0 place-items-center rounded-lg bg-noche px-2 font-titulo text-xl font-extrabold text-acento"
          aria-label={`Puzzle ${numero}`}
        >
          {numero}
        </span>
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          onBlur={guardarDatos}
          placeholder={`Puzzle ${numero}`}
          aria-label={`Título del puzzle ${numero}`}
          className="min-w-0 flex-1 rounded-lg border-2 border-transparent bg-transparent px-2 py-1 font-titulo text-2xl font-bold uppercase tracking-wide text-noche placeholder:text-noche/70 hover:border-borde focus:border-marca focus:bg-superficie focus:outline-none focus:ring-2 focus:ring-acento"
        />
        {incompleto ? (
          <Insignia variante="aviso" icono="⚠">Incompleto</Insignia>
        ) : (
          <Insignia variante="exito" icono="✓">Completo</Insignia>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
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
      <div>
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <label htmlFor={`clave-${puzzle.id}`} className={etiqueta}>Contraseña</label>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${numerica ? "text-tinta-suave" : "text-noche"}`}>Alfanumérica</span>
            <button
              type="button"
              role="switch"
              aria-checked={numerica}
              aria-label="Contraseña numérica"
              disabled={pendiente}
              onClick={() => cambiarTipoClave(!numerica)}
              className={`relative h-7 w-12 shrink-0 rounded-full border-2 transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acento ${numerica ? "border-noche bg-noche" : "border-borde bg-papel"}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full transition-all ${numerica ? "left-[1.375rem] bg-acento" : "left-0.5 bg-tinta-suave"}`} />
            </button>
            <span className={`text-sm font-semibold ${numerica ? "text-noche" : "text-tinta-suave"}`}>Numérica</span>
          </div>
        </div>
        <input
          id={`clave-${puzzle.id}`}
          value={contrasena}
          onChange={(e) => setContrasena(numerica ? soloDigitos(e.target.value) : e.target.value)}
          onBlur={guardarDatos}
          className={campo}
          autoComplete="off"
          inputMode={numerica ? "numeric" : "text"}
        />
        {numerica && contrasena.trim() && (
          <p className={`${apoyo} mt-1`}>El jugador verá {contrasena.trim().length} casillas, una por dígito.</p>
        )}
      </div>
      {props.minijuego && !contrasena.trim() && (
        <p className={estiloError}>Un puzzle con minijuego necesita contraseña: es lo que el jugador obtiene al resolverlo.</p>
      )}
      {seccion("enunciado", props.enunciado)}
      {seccion("recompensa", props.recompensa)}
      {mensaje && <p className={estiloError}>{mensaje}</p>}
    </article>
  );
}
