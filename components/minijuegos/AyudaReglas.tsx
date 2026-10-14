"use client";

import { useId, useState } from "react";

/** Icono «?» que muestra las reglas al pasar el ratón, al enfocarlo con el teclado o al tocarlo */
export default function AyudaReglas({ texto }: { texto: string }) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <span className="relative inline-flex" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      <button
        type="button"
        aria-label="Cómo se juega"
        aria-describedby={visible ? id : undefined}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        onPointerDown={(e) => e.pointerType === "touch" && setVisible((v) => !v)}
        className="grid h-8 w-8 place-items-center rounded-full border-2 border-noche font-titulo text-lg font-extrabold leading-none text-noche transition hover:bg-noche hover:text-acento focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acento"
      >
        ?
      </button>
      {visible && (
        <span
          id={id}
          role="tooltip"
          className="absolute right-0 top-full z-20 mt-2 w-72 max-w-[80vw] rounded-lg border-2 border-noche bg-superficie p-3 text-sm font-normal normal-case leading-snug tracking-normal text-tinta shadow-xl shadow-noche/20"
        >
          {texto}
        </span>
      )}
    </span>
  );
}
