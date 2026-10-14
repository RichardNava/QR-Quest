"use client";

import { useState } from "react";
import { pulsarLuz, todoApagado } from "@/lib/minijuegos/reglas";
import type { RespuestaLightsOut, VistaLightsOut } from "@/lib/minijuegos/tipos";

type Props = {
  vista: VistaLightsOut;
  alTerminar: (respuesta: RespuestaLightsOut) => void;
  bloqueado: boolean;
};

export default function LightsOut({ vista, alTerminar, bloqueado }: Props) {
  const [luces, setLuces] = useState(vista.encendidas);
  // Casillas pulsadas un número impar de veces (las pares se anulan)
  const [impares, setImpares] = useState<Set<string>>(new Set());

  function pulsar(fila: number, col: number) {
    if (bloqueado) return;
    const nuevas = pulsarLuz(luces, fila, col);
    const clave = `${fila},${col}`;
    const nuevoSet = new Set(impares);
    if (nuevoSet.has(clave)) nuevoSet.delete(clave);
    else nuevoSet.add(clave);
    setLuces(nuevas);
    setImpares(nuevoSet);
    if (todoApagado(nuevas)) {
      alTerminar({
        pulsadas: [...nuevoSet].map((k) => {
          const [f, c] = k.split(",").map(Number);
          return { fila: f, col: c };
        }),
      });
    }
  }

  return (
    <div className="space-y-3">
      <div
        className="mx-auto grid w-full max-w-xs gap-1"
        style={{ gridTemplateColumns: `repeat(${vista.tamano}, 1fr)` }}
        role="grid"
        aria-label="Tablero de luces"
      >
        {luces.map((fila, f) =>
          fila.map((encendida, c) => (
            <button
              key={`${f}-${c}`}
              type="button"
              disabled={bloqueado}
              onClick={() => pulsar(f, c)}
              aria-label={`Fila ${f + 1}, columna ${c + 1}: ${encendida ? "encendida" : "apagada"}`}
              className={`flex aspect-square min-h-[44px] items-center justify-center rounded-lg border-2 text-xl font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acento ${
                encendida ? "border-noche bg-acento text-noche" : "border-borde bg-superficie text-tinta-suave"
              }`}
            >
              <span aria-hidden="true">{encendida ? "●" : "○"}</span>
            </button>
          ))
        )}
      </div>
      <p className="text-center text-sm text-tinta-suave">● encendida · ○ apagada</p>
    </div>
  );
}
