"use client";

import { useRef, useState } from "react";
import { deslizar, rushHourResuelto, TAMANO_RUSH_HOUR as N } from "@/lib/minijuegos/reglas";
import type { PiezaRushHour, RespuestaRushHour, VistaRushHour } from "@/lib/minijuegos/tipos";
import { botonSecundario } from "../estilos";

type Props = {
  vista: VistaRushHour;
  alTerminar: (respuesta: RespuestaRushHour) => void;
  bloqueado: boolean;
};

// Cada vehículo lleva su letra y un relleno distinto, para no depender solo del color
const RELLENOS = ["bg-noche-suave text-superficie", "bg-acento text-noche", "bg-tinta-suave text-superficie", "bg-acento-suave text-noche"];
const letra = (id: number) => String.fromCharCode(64 + id); // 1 → A

export default function RushHour({ vista, alTerminar, bloqueado }: Props) {
  const [piezas, setPiezas] = useState<PiezaRushHour[]>(vista.piezas);
  const [elegida, setElegida] = useState<number>(0);
  const movimientos = useRef<{ id: number; casillas: number }[]>([]);
  const resuelto = rushHourResuelto(piezas);
  const pieza = piezas.find((p) => p.id === elegida);

  function mover(paso: number) {
    if (bloqueado || resuelto || !pieza) return;
    const nuevas = deslizar(piezas, pieza.id, paso);
    if (!nuevas) return;
    // Pasos seguidos de la misma pieza se agrupan en un solo movimiento
    const ultimo = movimientos.current[movimientos.current.length - 1];
    if (ultimo && ultimo.id === pieza.id) {
      ultimo.casillas += paso;
      if (ultimo.casillas === 0) movimientos.current.pop();
    } else {
      movimientos.current.push({ id: pieza.id, casillas: paso });
    }
    setPiezas(nuevas);
    if (rushHourResuelto(nuevas)) alTerminar({ movimientos: movimientos.current.map((m) => ({ ...m })) });
  }

  function alPulsarTecla(e: React.KeyboardEvent) {
    if (!pieza) return;
    const mapa: Record<string, [boolean, number]> = {
      ArrowLeft: [true, -1],
      ArrowRight: [true, 1],
      ArrowUp: [false, -1],
      ArrowDown: [false, 1],
    };
    const m = mapa[e.key];
    if (!m || m[0] !== pieza.horizontal) return;
    e.preventDefault();
    mover(m[1]);
  }

  const horizontal = pieza?.horizontal ?? true;
  return (
    <div className="space-y-3" onKeyDown={alPulsarTecla}>
      <div className="mx-auto flex w-full max-w-sm items-stretch gap-1">
        <div
          className="relative aspect-square min-w-0 flex-1 rounded-lg border-2 border-noche bg-papel"
          role="group"
          aria-label="Tablero de Rush Hour"
        >
          {piezas.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={bloqueado}
              onClick={() => setElegida(p.id)}
              aria-pressed={elegida === p.id}
              aria-label={p.objetivo ? "Tu pieza" : `Vehículo ${letra(p.id)}`}
              className={`absolute flex items-center justify-center rounded-md border-2 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acento ${
                p.objetivo ? "bg-marca text-superficie" : RELLENOS[p.id % RELLENOS.length]
              } ${elegida === p.id ? "border-noche ring-2 ring-acento" : "border-superficie"}`}
              style={{
                left: `${(p.col / N) * 100}%`,
                top: `${(p.fila / N) * 100}%`,
                width: `${((p.horizontal ? p.largo : 1) / N) * 100}%`,
                height: `${((p.horizontal ? 1 : p.largo) / N) * 100}%`,
              }}
            >
              {p.objetivo ? "Tu pieza" : letra(p.id)}
            </button>
          ))}
        </div>
        {/* La salida está a la derecha, en la fila de la pieza objetivo */}
        <div className="relative w-8 shrink-0" aria-hidden="true">
          <span
            className="absolute flex w-full items-center justify-center text-xs font-bold text-marca"
            style={{ top: `${(vista.salida.fila / N) * 100}%`, height: `${100 / N}%` }}
          >
            Salida ➜
          </span>
        </div>
      </div>
      <p className="text-center text-sm text-tinta-suave" aria-live="polite">
        {pieza ? `Pieza elegida: ${pieza.objetivo ? "tu pieza" : `vehículo ${letra(pieza.id)}`}` : "Elige una pieza"}
      </p>
      <div className="mx-auto grid w-44 grid-cols-3 gap-1" aria-label="Mover la pieza elegida">
        <span />
        <button type="button" className={botonSecundario} disabled={bloqueado || horizontal} onClick={() => mover(-1)} aria-label="Arriba">▲</button>
        <span />
        <button type="button" className={botonSecundario} disabled={bloqueado || !horizontal} onClick={() => mover(-1)} aria-label="Izquierda">◀</button>
        <button type="button" className={botonSecundario} disabled={bloqueado || horizontal} onClick={() => mover(1)} aria-label="Abajo">▼</button>
        <button type="button" className={botonSecundario} disabled={bloqueado || !horizontal} onClick={() => mover(1)} aria-label="Derecha">▶</button>
      </div>
    </div>
  );
}
