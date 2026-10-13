"use client";

import { useRef, useState } from "react";
import { crearClienteNavegador } from "@/lib/supabase/cliente";
import { MAX_BYTES_IMAGEN } from "@/lib/limites";
import { botonSecundario, error as estiloError } from "./estilos";

type Props = {
  masterId: string;
  aventuraId: string;
  /** Debe devolver un mensaje de error si el elemento no pudo crearse */
  alSubir: (ruta: string) => Promise<string | null>;
};

export default function SubidaImagen({ masterId, aventuraId, alSubir }: Props) {
  const entrada = useRef<HTMLInputElement>(null);
  const [mensaje, setMensaje] = useState("");
  const [subiendo, setSubiendo] = useState(false);

  async function elegir(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (entrada.current) entrada.current.value = "";
    if (!archivo) return;
    setMensaje("");
    if (!archivo.type.startsWith("image/")) {
      setMensaje("El archivo no es una imagen válida.");
      return;
    }
    if (archivo.size > MAX_BYTES_IMAGEN) {
      const mb = (archivo.size / (1024 * 1024)).toFixed(1).replace(".", ",");
      setMensaje(`Esta imagen pesa ${mb} MB; el máximo es 4 MB.`);
      return;
    }
    setSubiendo(true);
    const supabase = crearClienteNavegador();
    const extension = (archivo.name.split(".").pop() || "img").toLowerCase().replace(/[^a-z0-9]/g, "");
    const ruta = `${masterId}/${aventuraId}/${crypto.randomUUID()}.${extension || "img"}`;
    const { error } = await supabase.storage.from("imagenes").upload(ruta, archivo, { contentType: archivo.type });
    if (error) {
      const grande = /size|large|exceed/i.test(error.message);
      setMensaje(grande ? "Esta imagen pesa más de 4 MB; el máximo es 4 MB." : "No hemos podido subir la imagen. Inténtalo de nuevo.");
      setSubiendo(false);
      return;
    }
    const fallo = await alSubir(ruta);
    if (fallo) {
      // El elemento no se creó: no dejamos el archivo huérfano
      await supabase.storage.from("imagenes").remove([ruta]);
      setMensaje(fallo);
    }
    setSubiendo(false);
  }

  return (
    <div className="space-y-2">
      <input ref={entrada} type="file" accept="image/*" onChange={elegir} className="hidden" />
      <button type="button" disabled={subiendo} onClick={() => entrada.current?.click()} className={botonSecundario}>
        {subiendo ? "Subiendo…" : "Añadir imagen"}
      </button>
      {mensaje && <p className={estiloError}>{mensaje}</p>}
    </div>
  );
}
