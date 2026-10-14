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

/** Cuántas casillas puede deslizarse una pieza en cada sentido sin chocar */
function margen(piezas: PiezaRushHour[], id: number): { atras: number; adelante: number } {
  let atras = 0;
  let adelante = 0;
  while (deslizar(piezas, id, -(atras + 1))) atras++;
  while (deslizar(piezas, id, adelante + 1)) adelante++;
  return { atras, adelante };
}

type Arrastre = {
  id: number;
  inicio: number; // coordenada del puntero al empezar, en píxeles, a lo largo del eje de la pieza
  desplazamiento: number; // píxeles que se ha movido la pieza (ya limitado a lo que cabe)
  min: number;
  max: number;
};

export default function RushHour({ vista, alTerminar, bloqueado }: Props) {
  const [piezas, setPiezas] = useState<PiezaRushHour[]>(vista.piezas);
  const [elegida, setElegida] = useState<number>(0);
  const [arrastre, setArrastre] = useState<Arrastre | null>(null);
  const tablero = useRef<HTMLDivElement>(null);
  const movimientos = useRef<{ id: number; casillas: number }[]>([]);
  const resuelto = rushHourResuelto(piezas);
  const pieza = piezas.find((p) => p.id === elegida);

  /** Desliza una pieza `casillas` (con signo) y anota el movimiento */
  function moverPieza(id: number, casillas: number) {
    if (bloqueado || resuelto || casillas === 0) return;
    const nuevas = deslizar(piezas, id, casillas);
    if (!nuevas) return;
    // Movimientos seguidos de la misma pieza se agrupan en uno solo
    const ultimo = movimientos.current[movimientos.current.length - 1];
    if (ultimo && ultimo.id === id) {
      ultimo.casillas += casillas;
      if (ultimo.casillas === 0) movimientos.current.pop();
    } else {
      movimientos.current.push({ id, casillas });
    }
    setPiezas(nuevas);
    if (rushHourResuelto(nuevas)) alTerminar({ movimientos: movimientos.current.map((m) => ({ ...m })) });
  }

  const tamanoCasilla = () => (tablero.current?.clientWidth ?? 1) / N;

  function empezarArrastre(e: React.PointerEvent, p: PiezaRushHour) {
    setElegida(p.id);
    if (bloqueado || resuelto) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const { atras, adelante } = margen(piezas, p.id);
    const casilla = tamanoCasilla();
    setArrastre({
      id: p.id,
      inicio: p.horizontal ? e.clientX : e.clientY,
      desplazamiento: 0,
      min: -atras * casilla,
      max: adelante * casilla,
    });
  }

  function arrastrar(e: React.PointerEvent, p: PiezaRushHour) {
    if (!arrastre || arrastre.id !== p.id) return;
    const bruto = (p.horizontal ? e.clientX : e.clientY) - arrastre.inicio;
    setArrastre({ ...arrastre, desplazamiento: Math.min(arrastre.max, Math.max(arrastre.min, bruto)) });
  }

  function soltar(p: PiezaRushHour) {
    if (!arrastre || arrastre.id !== p.id) return;
    // La pieza encaja en la casilla más cercana a donde se ha soltado
    const casillas = Math.round(arrastre.desplazamiento / tamanoCasilla());
    setArrastre(null);
    moverPieza(p.id, casillas);
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
    if (!m) return;
    // Las flechas no deben desplazar la página mientras se juega
    e.preventDefault();
    if (m[0] === pieza.horizontal) moverPieza(pieza.id, m[1]);
  }

  const horizontal = pieza?.horizontal ?? true;
  return (
    <div className="space-y-3" onKeyDown={alPulsarTecla}>
      <div className="mx-auto flex w-full max-w-sm items-stretch gap-1">
        <div
          ref={tablero}
          className="relative aspect-square min-w-0 flex-1 touch-none select-none rounded-lg border-2 border-noche bg-papel"
          role="group"
          aria-label="Tablero de Rush Hour: arrastra los vehículos o usa las flechas"
        >
          {piezas.map((p) => {
            const moviendo = arrastre?.id === p.id;
            const px = moviendo ? arrastre.desplazamiento : 0;
            return (
              <button
                key={p.id}
                type="button"
                disabled={bloqueado}
                onPointerDown={(e) => empezarArrastre(e, p)}
                onPointerMove={(e) => arrastrar(e, p)}
                onPointerUp={() => soltar(p)}
                onPointerCancel={() => setArrastre(null)}
                aria-pressed={elegida === p.id}
                aria-label={p.objetivo ? "Tu pieza" : `Vehículo ${letra(p.id)}`}
                className={`absolute flex touch-none items-center justify-center rounded-md border-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acento ${
                  bloqueado ? "cursor-default" : moviendo ? "cursor-grabbing" : "cursor-grab"
                } ${moviendo ? "" : "transition-all"} ${
                  p.objetivo ? "bg-marca text-superficie" : RELLENOS[p.id % RELLENOS.length]
                } ${elegida === p.id ? "border-noche ring-2 ring-acento" : "border-superficie"} ${moviendo ? "z-10 shadow-lg" : ""}`}
                style={{
                  left: `${(p.col / N) * 100}%`,
                  top: `${(p.fila / N) * 100}%`,
                  width: `${((p.horizontal ? p.largo : 1) / N) * 100}%`,
                  height: `${((p.horizontal ? 1 : p.largo) / N) * 100}%`,
                  transform: p.horizontal ? `translateX(${px}px)` : `translateY(${px}px)`,
                }}
              >
                {p.objetivo ? "Tu pieza" : letra(p.id)}
              </button>
            );
          })}
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
        {" · "}Arrastra un vehículo o usa los botones
      </p>
      <div className="mx-auto grid w-44 grid-cols-3 gap-1" aria-label="Mover la pieza elegida">
        <span />
        <button type="button" className={botonSecundario} disabled={bloqueado || horizontal} onClick={() => pieza && moverPieza(pieza.id, -1)} aria-label="Arriba">▲</button>
        <span />
        <button type="button" className={botonSecundario} disabled={bloqueado || !horizontal} onClick={() => pieza && moverPieza(pieza.id, -1)} aria-label="Izquierda">◀</button>
        <button type="button" className={botonSecundario} disabled={bloqueado || horizontal} onClick={() => pieza && moverPieza(pieza.id, 1)} aria-label="Abajo">▼</button>
        <button type="button" className={botonSecundario} disabled={bloqueado || !horizontal} onClick={() => pieza && moverPieza(pieza.id, 1)} aria-label="Derecha">▶</button>
      </div>
    </div>
  );
}
