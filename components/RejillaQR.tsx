"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { boton } from "./estilos";

type Props = { nombreAventura: string; puzzles: { token: string; numero: number }[] };

export default function RejillaQR({ nombreAventura, puzzles }: Props) {
  const [origen, setOrigen] = useState("");
  useEffect(() => setOrigen(window.location.origin), []);

  return (
    <div className="space-y-4">
      <div className="no-imprimir">
        <button type="button" className={boton} onClick={() => window.print()}>Imprimir</button>
      </div>
      <ul className="grid grid-cols-2 gap-4 print:grid-cols-3 lg:grid-cols-3">
        {puzzles.map((p) => (
          <li key={p.token} className="flex flex-col items-center gap-2 rounded-lg border border-slate-300 bg-white p-3 text-center [break-inside:avoid]">
            {origen && <QRCodeSVG value={`${origen}/p/${p.token}`} level="M" marginSize={4} className="h-auto w-full max-w-[200px]" />}
            <span className="text-sm font-medium">{nombreAventura} · Puzzle {p.numero}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
