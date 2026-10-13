"use client";

import { useState } from "react";
import type { ElementoVista } from "@/lib/tipos";
import ImagenDifuminada from "./ImagenDifuminada";
import Rompecabezas from "./Rompecabezas";

export default function Recompensa({ elementos }: { elementos: ElementoVista[] }) {
  const totalRompecabezas = elementos.filter((e) => e.tipo === "imagen" && e.modo === "rompecabezas").length;
  const [resueltos, setResueltos] = useState(0);
  // La pista (textos) aparece cuando todos los rompecabezas están resueltos
  const textosVisibles = resueltos >= totalRompecabezas;

  return (
    <div className="space-y-4">
      {elementos.map((e, i) => {
        if (e.tipo === "texto") {
          return textosVisibles ? (
            <p key={i} className="whitespace-pre-line text-lg">{e.texto}</p>
          ) : null;
        }
        if (e.modo === "difuminado") return <ImagenDifuminada key={i} url={e.url} />;
        if (e.modo === "rompecabezas") {
          return <Rompecabezas key={i} url={e.url} alAcabar={() => setResueltos((n) => n + 1)} />;
        }
        // eslint-disable-next-line @next/next/no-img-element
        return <img key={i} src={e.url} alt="Recompensa" className="h-auto max-w-full rounded-lg" />;
      })}
    </div>
  );
}
