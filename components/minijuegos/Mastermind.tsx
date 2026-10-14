"use client";

import { useState } from "react";
import type { PistasMastermind, VistaMastermind } from "@/lib/minijuegos/tipos";
import { boton, botonSecundario, aviso } from "../estilos";

type Props = {
  vista: VistaMastermind;
  /** Comprueba un intento en el servidor: devuelve pistas, o la contraseña si es el código */
  probar: (codigo: number[]) => Promise<PistasMastermind | { contrasena: string }>;
  bloqueado: boolean;
};

// Cada símbolo se distingue por forma y letra; el color solo refuerza
const SIMBOLOS = ["●", "▲", "■", "◆", "★", "✚", "⬟", "⬢"];
const LETRAS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const COLORES = ["text-marca", "text-exito", "text-noche", "text-peligro", "text-acento", "text-tinta-suave", "text-marca-oscura", "text-noche-suave"];

type Intento = { codigo: number[]; pistas: PistasMastermind };

function Ficha({ n, grande = false }: { n: number | null; grande?: boolean }) {
  if (n === null) return <span className="text-tinta-suave" aria-label="Vacía">—</span>;
  return (
    <span className={`inline-flex items-center gap-0.5 font-bold ${COLORES[n]} ${grande ? "text-xl" : "text-base"}`}>
      <span aria-hidden="true">{SIMBOLOS[n]}</span>
      <span className="text-xs">{LETRAS[n]}</span>
    </span>
  );
}

export default function Mastermind({ vista, probar, bloqueado }: Props) {
  const [intentos, setIntentos] = useState<Intento[]>([]);
  const [actual, setActual] = useState<(number | null)[]>(Array(vista.longitud).fill(null));
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const agotados = intentos.length >= vista.intentos && !bloqueado;
  const completo = actual.every((x) => x !== null);

  function poner(n: number) {
    const hueco = actual.findIndex((x) => x === null);
    if (hueco < 0) return;
    setActual(actual.map((x, i) => (i === hueco ? n : x)));
  }

  async function enviar() {
    if (!completo || enviando || bloqueado || agotados) return;
    setError("");
    setEnviando(true);
    try {
      const codigo = actual as number[];
      const r = await probar(codigo);
      const pistas = "contrasena" in r ? { enSuSitio: vista.longitud, enOtroSitio: 0 } : r;
      setIntentos([...intentos, { codigo, pistas }]);
      setActual(Array(vista.longitud).fill(null));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No hemos podido comprobar la combinación.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-tinta" aria-live="polite">
        Intento {Math.min(intentos.length + 1, vista.intentos)} de {vista.intentos}
      </p>
      <ol className="space-y-1" aria-label="Intentos anteriores">
        {intentos.map((i, k) => (
          <li key={k} className="flex flex-wrap items-center gap-2 rounded-lg border border-borde bg-superficie px-2 py-1">
            <span className="w-5 text-xs text-tinta-suave">{k + 1}.</span>
            <span className="flex gap-2">
              {i.codigo.map((n, j) => (
                <Ficha key={j} n={n} />
              ))}
            </span>
            <span className="ml-auto text-sm text-tinta">
              {i.pistas.enSuSitio} en su sitio · {i.pistas.enOtroSitio} en otro sitio
            </span>
          </li>
        ))}
      </ol>

      {agotados ? (
        <div className="space-y-2">
          <p className={aviso} role="alert">Se han acabado los intentos.</p>
          <button
            type="button"
            className={botonSecundario}
            onClick={() => {
              setIntentos([]);
              setActual(Array(vista.longitud).fill(null));
            }}
          >
            Reintentar
          </button>
        </div>
      ) : (
        !bloqueado && (
          <>
            <div className="flex flex-wrap items-center gap-2" aria-label="Tu combinación">
              {actual.map((n, i) => (
                <button
                  key={i}
                  type="button"
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border-2 border-noche bg-superficie px-1"
                  onClick={() => setActual(actual.map((x, j) => (j === i ? null : x)))}
                  aria-label={n === null ? `Ranura ${i + 1} vacía` : `Ranura ${i + 1}: ${LETRAS[n]}, pulsa para quitar`}
                >
                  <Ficha n={n} grande />
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2" aria-label="Símbolos disponibles">
              {Array.from({ length: vista.simbolos }, (_, n) => (
                <button
                  key={n}
                  type="button"
                  disabled={!vista.repetidos && actual.includes(n)}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border-2 border-borde bg-papel px-1 disabled:opacity-40"
                  onClick={() => poner(n)}
                  aria-label={`Símbolo ${LETRAS[n]}`}
                >
                  <Ficha n={n} grande />
                </button>
              ))}
            </div>
            {!vista.repetidos && <p className="text-xs text-tinta-suave">En este nivel no se repite ningún símbolo.</p>}
            {error && <p className={aviso} role="alert">{error}</p>}
            <button type="button" className={`${boton} w-full`} disabled={!completo || enviando} onClick={enviar}>
              {enviando ? "Comprobando…" : "Probar combinación"}
            </button>
          </>
        )
      )}
    </div>
  );
}
