"use client";

import { useState } from "react";
import type { RespuestaSudoku, VistaSudoku } from "@/lib/minijuegos/tipos";
import { boton, botonSecundario } from "../estilos";

type Props = {
  vista: VistaSudoku;
  alTerminar: (respuesta: RespuestaSudoku) => void;
  bloqueado: boolean;
};

export default function Sudoku({ vista, alTerminar, bloqueado }: Props) {
  const [valores, setValores] = useState<(number | null)[][]>(vista.casillas);
  const [elegida, setElegida] = useState<{ f: number; c: number } | null>(null);
  const completo = valores.every((fila) => fila.every((v) => v !== null));

  function poner(n: number | null) {
    if (!elegida || bloqueado || vista.casillas[elegida.f][elegida.c] !== null) return;
    setValores(valores.map((fila, f) => fila.map((v, c) => (f === elegida.f && c === elegida.c ? n : v))));
  }

  function alPulsarTecla(e: React.KeyboardEvent) {
    if (/^[1-9]$/.test(e.key)) poner(Number(e.key));
    else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") poner(null);
  }

  return (
    <div className="space-y-3" onKeyDown={alPulsarTecla}>
      <div
        className="mx-auto grid aspect-square w-full max-w-md grid-cols-9 border-2 border-noche bg-superficie"
        role="grid"
        aria-label="Tablero de Sudoku"
      >
        {valores.map((fila, f) =>
          fila.map((v, c) => {
            const dada = vista.casillas[f][c] !== null;
            const esElegida = elegida?.f === f && elegida?.c === c;
            return (
              <button
                key={`${f}-${c}`}
                type="button"
                disabled={bloqueado}
                onClick={() => setElegida({ f, c })}
                aria-label={`Fila ${f + 1}, columna ${c + 1}: ${v ?? "vacía"}${dada ? ", dada" : ""}`}
                className={`flex items-center justify-center border border-borde text-[length:clamp(0.8rem,4vw,1.4rem)] leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-acento ${
                  c % 3 === 2 && c !== 8 ? "border-r-2 border-r-noche" : ""
                } ${f % 3 === 2 && f !== 8 ? "border-b-2 border-b-noche" : ""} ${
                  dada ? "bg-papel font-extrabold text-noche" : "font-semibold text-marca"
                } ${esElegida ? "bg-acento-suave" : ""}`}
              >
                {v}
              </button>
            );
          })
        )}
      </div>
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1" aria-label="Teclado numérico">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button key={n} type="button" className={botonSecundario} disabled={bloqueado} onClick={() => poner(n)}>
            {n}
          </button>
        ))}
        <button type="button" className={botonSecundario} disabled={bloqueado} onClick={() => poner(null)} aria-label="Borrar">
          ⌫
        </button>
      </div>
      <button
        type="button"
        className={`${boton} w-full max-w-md`}
        disabled={!completo || bloqueado}
        onClick={() => alTerminar({ casillas: valores as number[][] })}
      >
        Comprobar
      </button>
      {!completo && <p className="text-center text-xs text-tinta-suave">Rellena todas las casillas para poder comprobar.</p>}
    </div>
  );
}
