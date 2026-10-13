"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { crearAventura, eliminarAventura } from "@/app/aventuras/actions";
import { boton, botonPeligro, campo, error as estiloError, tarjeta } from "./estilos";

export type ResumenAventura = { id: string; nombre: string; creada_en: string; puzzles: number };

export default function ListaAventuras({ aventuras }: { aventuras: ResumenAventura[] }) {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [pendiente, empezar] = useTransition();

  function crear(e: React.FormEvent) {
    e.preventDefault();
    setMensaje("");
    empezar(async () => {
      const r = await crearAventura(nombre);
      if (r.error) return setMensaje(r.error);
      router.push(`/aventuras/${r.id}`);
    });
  }

  function borrar(a: ResumenAventura) {
    if (!window.confirm(`¿Eliminar «${a.nombre}»? Se borrarán sus puzzles e imágenes y sus QR dejarán de funcionar.`)) return;
    setMensaje("");
    empezar(async () => {
      const r = await eliminarAventura(a.id);
      if (r.error) setMensaje(r.error);
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={crear} className={`${tarjeta} space-y-3`}>
        <h2 className="text-lg font-bold">Nueva aventura</h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre de la aventura" aria-label="Nombre de la aventura" className={campo} />
          <button type="submit" disabled={pendiente} className={`${boton} whitespace-nowrap`}>Crear aventura</button>
        </div>
      </form>
      {mensaje && <p className={estiloError}>{mensaje}</p>}
      {aventuras.length === 0 ? (
        <p className="text-center text-slate-600">Aún no tienes aventuras. ¡Crea la primera!</p>
      ) : (
        <ul className="space-y-3">
          {aventuras.map((a) => (
            <li key={a.id} className={`${tarjeta} flex flex-wrap items-center justify-between gap-3`}>
              <div>
                <Link href={`/aventuras/${a.id}`} className="text-lg font-bold text-indigo-700 underline">{a.nombre}</Link>
                <p className="text-sm text-slate-600">
                  {a.puzzles} {a.puzzles === 1 ? "puzzle" : "puzzles"} · creada el{" "}
                  {new Date(a.creada_en).toLocaleDateString("es-ES")}
                </p>
              </div>
              <button type="button" disabled={pendiente} onClick={() => borrar(a)} className={botonPeligro}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
