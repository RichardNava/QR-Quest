"use client";

import { useRef, useState } from "react";
import { pasoLaberinto } from "@/lib/minijuegos/reglas";
import type { Direccion, Posicion, RespuestaLaberinto, VistaLaberinto } from "@/lib/minijuegos/tipos";
import { botonSecundario } from "../estilos";

type Props = {
  vista: VistaLaberinto;
  alTerminar: (respuesta: RespuestaLaberinto) => void;
  bloqueado: boolean;
};

const CONTRARIA: Record<Direccion, Direccion> = { N: "S", S: "N", E: "O", O: "E" };
const TECLAS: Record<string, Direccion> = { ArrowUp: "N", ArrowDown: "S", ArrowRight: "E", ArrowLeft: "O" };

export default function Laberinto({ vista, alTerminar, bloqueado }: Props) {
  const [pos, setPos] = useState<Posicion>(vista.inicio);
  // Camino sin idas y vueltas: deshacer un paso lo quita en vez de añadir otro
  const camino = useRef<Direccion[]>([]);
  const llegada = pos.fila === vista.meta.fila && pos.col === vista.meta.col;

  function mover(dir: Direccion) {
    if (bloqueado || llegada) return;
    const siguiente = pasoLaberinto(vista, pos, dir);
    if (!siguiente) return;
    const ultimo = camino.current[camino.current.length - 1];
    if (ultimo && CONTRARIA[ultimo] === dir) camino.current.pop();
    else camino.current.push(dir);
    setPos(siguiente);
    if (siguiente.fila === vista.meta.fila && siguiente.col === vista.meta.col) {
      alTerminar({ movimientos: [...camino.current] });
    }
  }

  function alPulsarTecla(e: React.KeyboardEvent) {
    const dir = TECLAS[e.key];
    if (!dir) return;
    e.preventDefault();
    mover(dir);
  }

  const celdas = [];
  for (let f = 0; f < vista.alto; f++) {
    for (let c = 0; c < vista.ancho; c++) {
      const esFicha = pos.fila === f && pos.col === c;
      const esMeta = vista.meta.fila === f && vista.meta.col === c;
      const paredDerecha = c === vista.ancho - 1 || vista.paredes.derecha[f][c];
      const paredAbajo = f === vista.alto - 1 || vista.paredes.abajo[f][c];
      celdas.push(
        <div
          key={`${f}-${c}`}
          className={`flex items-center justify-center text-[length:clamp(0.6rem,3.5vw,1.25rem)] leading-none ${
            paredDerecha ? "border-r-2 border-r-noche" : ""
          } ${paredAbajo ? "border-b-2 border-b-noche" : ""} ${esMeta ? "bg-exito-suave" : ""}`}
        >
          {esFicha ? (
            <span className="font-bold text-marca" aria-label="Tu ficha">●</span>
          ) : esMeta ? (
            <span className="font-bold text-exito" aria-label="Meta">★</span>
          ) : null}
        </div>
      );
    }
  }

  return (
    <div className="space-y-3" onKeyDown={alPulsarTecla}>
      <div
        tabIndex={0}
        role="group"
        aria-label="Laberinto: usa las flechas del teclado o los botones para mover la ficha"
        className="mx-auto grid aspect-square w-full max-w-md border-l-2 border-t-2 border-noche bg-superficie focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acento"
        style={{ gridTemplateColumns: `repeat(${vista.ancho}, 1fr)` }}
      >
        {celdas}
      </div>
      <p className="text-center text-sm text-tinta-suave">
        <span className="font-bold text-marca">●</span> tu ficha · <span className="font-bold text-exito">★</span> meta
      </p>
      <div className="mx-auto grid w-44 grid-cols-3 gap-1" aria-label="Mover la ficha">
        <span />
        <button type="button" className={botonSecundario} onClick={() => mover("N")} aria-label="Arriba" disabled={bloqueado}>▲</button>
        <span />
        <button type="button" className={botonSecundario} onClick={() => mover("O")} aria-label="Izquierda" disabled={bloqueado}>◀</button>
        <button type="button" className={botonSecundario} onClick={() => mover("S")} aria-label="Abajo" disabled={bloqueado}>▼</button>
        <button type="button" className={botonSecundario} onClick={() => mover("E")} aria-label="Derecha" disabled={bloqueado}>▶</button>
      </div>
    </div>
  );
}
