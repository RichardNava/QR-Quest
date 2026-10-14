"use client";

import { useRef } from "react";

type Props = { longitud: number; valor: string; alCambiar: (valor: string) => void };

/** Una casilla por dígito: se avanza solo al escribir, Retroceso vuelve atrás y se puede pegar el código entero */
export default function CasillasDigitos({ longitud, valor, alCambiar }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digitos = Array.from({ length: longitud }, (_, i) => valor[i] ?? "");

  function escribir(i: number, texto: string) {
    const nuevos = texto.replace(/\D/g, "");
    if (!nuevos) return;
    const lista = [...digitos];
    let k = i;
    for (const d of nuevos) {
      if (k >= longitud) break;
      lista[k++] = d;
    }
    alCambiar(lista.join(""));
    refs.current[Math.min(k, longitud - 1)]?.focus();
  }

  function pulsar(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      const lista = [...digitos];
      if (lista[i]) {
        lista[i] = "";
      } else if (i > 0) {
        lista[i - 1] = "";
        refs.current[i - 1]?.focus();
      }
      alCambiar(lista.join(""));
    } else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    else if (e.key === "ArrowRight" && i < longitud - 1) refs.current[i + 1]?.focus();
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={`Contraseña de ${longitud} dígitos`}>
      {digitos.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          onChange={(e) => escribir(i, e.target.value)}
          onKeyDown={(e) => pulsar(i, e)}
          onFocus={(e) => e.currentTarget.select()}
          inputMode="numeric"
          autoComplete="off"
          aria-label={`Dígito ${i + 1} de ${longitud}`}
          className="h-14 w-11 rounded-lg border-2 border-borde bg-superficie text-center font-titulo text-3xl font-bold text-tinta shadow-inner focus:border-marca focus:outline-none focus:ring-2 focus:ring-acento"
        />
      ))}
    </div>
  );
}
