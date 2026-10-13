"use client";

import { useState } from "react";
import { botonSecundario } from "./estilos";

export default function ImagenDifuminada({ url }: { url: string }) {
  const [revelada, setRevelada] = useState(false);
  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="Imagen difuminada"
          onClick={() => setRevelada(true)}
          className={`h-auto max-w-full transition duration-700 ${revelada ? "blur-0" : "blur-xl"}`}
        />
      </div>
      {!revelada && (
        <button type="button" onClick={() => setRevelada(true)} className={botonSecundario}>
          Revelar imagen
        </button>
      )}
    </div>
  );
}
