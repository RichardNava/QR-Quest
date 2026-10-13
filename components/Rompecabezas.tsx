"use client";

import { DndContext, MouseSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import { barajar, estaResuelto } from "@/lib/barajar";

const N = 3;

function Pieza({ indice, posicion, url }: { indice: number; posicion: number; url: string }) {
  const arrastrable = useDraggable({ id: `pieza-${posicion}` });
  const destino = useDroppable({ id: `hueco-${posicion}` });
  const fila = Math.floor(indice / N);
  const columna = indice % N;
  const estilo: React.CSSProperties = {
    backgroundImage: `url(${url})`,
    backgroundSize: `${N * 100}% ${N * 100}%`,
    backgroundPosition: `${(columna / (N - 1)) * 100}% ${(fila / (N - 1)) * 100}%`,
    touchAction: "none",
    transform: arrastrable.transform
      ? `translate3d(${arrastrable.transform.x}px, ${arrastrable.transform.y}px, 0)`
      : undefined,
    zIndex: arrastrable.isDragging ? 10 : undefined,
  };
  return (
    <div ref={destino.setNodeRef} className={`h-full w-full ${destino.isOver ? "ring-2 ring-inset ring-indigo-500" : ""}`}>
      <div
        ref={arrastrable.setNodeRef}
        {...arrastrable.listeners}
        {...arrastrable.attributes}
        style={estilo}
        className="h-full w-full cursor-grab"
        aria-label={`Pieza ${indice + 1}`}
      />
    </div>
  );
}

export default function Rompecabezas({ url, alAcabar }: { url: string; alAcabar?: () => void }) {
  const [orden, setOrden] = useState<number[]>(() => barajar(N * N));
  const [proporcion, setProporcion] = useState(1);
  const resuelto = estaResuelto(orden);
  const sensores = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 8 } })
  );

  useEffect(() => {
    const img = new Image();
    img.onload = () => img.naturalHeight && setProporcion(img.naturalWidth / img.naturalHeight);
    img.src = url;
  }, [url]);

  useEffect(() => {
    if (resuelto) alAcabar?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resuelto]);

  function alSoltar(e: DragEndEvent) {
    if (!e.over) return;
    const desde = Number(String(e.active.id).replace("pieza-", ""));
    const hasta = Number(String(e.over.id).replace("hueco-", ""));
    if (desde === hasta) return;
    setOrden((actual) => {
      const copia = [...actual];
      [copia[desde], copia[hasta]] = [copia[hasta], copia[desde]];
      return copia;
    });
  }

  if (resuelto) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="Imagen recompuesta" className="h-auto max-w-full rounded-lg" />
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-600">Arrastra los trozos para recomponer la imagen</p>
      <DndContext sensors={sensores} onDragEnd={alSoltar}>
        <div className="grid w-full grid-cols-3 grid-rows-3 gap-0 overflow-hidden" style={{ aspectRatio: String(proporcion) }}>
          {orden.map((indice, posicion) => (
            <Pieza key={posicion} indice={indice} posicion={posicion} url={url} />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
