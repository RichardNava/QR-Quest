"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import CerrarSesion from "./CerrarSesion";

const enlaceBase =
  "inline-flex min-h-[44px] items-center border-b-4 px-2 font-titulo text-lg uppercase tracking-wider text-superficie hover:text-acento focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acento";

function Opcion({ href, activa, children }: { href: string; activa: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={activa ? "page" : undefined}
      className={`${enlaceBase} ${activa ? "border-acento font-extrabold text-acento" : "border-transparent font-semibold"}`}
    >
      {children}
    </Link>
  );
}

// Brújula sencilla como logotipo
function Brujula() {
  return (
    <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true" className="shrink-0">
      <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M16 5l4 11-4 11-4-11z" fill="currentColor" />
      <circle cx="16" cy="16" r="2" fill="rgb(var(--color-noche))" />
    </svg>
  );
}

export default function Navegacion({ haySesion }: { haySesion: boolean }) {
  const ruta = usePathname() ?? "/";
  const cabeceraRef = useRef<HTMLElement>(null);

  // Publica la altura real de la cabecera (puede crecer con el menú de la aventura) para las barras pegajosas
  useEffect(() => {
    const el = cabeceraRef.current;
    if (!el) return;
    const medir = () => document.documentElement.style.setProperty("--altura-cabecera", `${el.offsetHeight}px`);
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, [ruta, haySesion]);

  const marca = (
    <Link
      href="/"
      className="inline-flex min-h-[48px] items-center gap-2 font-titulo text-2xl font-extrabold uppercase tracking-widest text-superficie focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acento"
    >
      <span className="text-acento"><Brujula /></span>
      <span>QR <span className="text-acento">Quest</span></span>
    </Link>
  );
  const cabecera = "no-imprimir sticky top-0 z-40 border-b-2 border-acento bg-noche/95 shadow-lg shadow-noche/30 backdrop-blur";

  // El jugador solo ve la marca
  if (ruta.startsWith("/p/")) {
    return (
      <header ref={cabeceraRef} className={cabecera}>
        <div className="mx-auto flex max-w-3xl items-center px-4">{marca}</div>
      </header>
    );
  }

  const aventura = ruta.match(/^\/aventuras\/([^/]+)(\/rejilla)?\/?$/);

  return (
    <header ref={cabeceraRef} className={cabecera}>
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-3 px-4">
        {marca}
        <nav aria-label="Principal" className="flex flex-wrap items-center gap-x-2">
          {haySesion ? (
            <>
              <Opcion href="/aventuras" activa={ruta === "/aventuras"}>Mis aventuras</Opcion>
              <CerrarSesion />
            </>
          ) : (
            <>
              <Opcion href="/entrar" activa={ruta === "/entrar"}>Entrar</Opcion>
              <Opcion href="/registro" activa={ruta === "/registro"}>Crear cuenta</Opcion>
            </>
          )}
        </nav>
      </div>
      {haySesion && aventura && (
        <nav aria-label="De la aventura" className="border-t border-superficie/10 bg-noche-suave">
          <div className="mx-auto flex max-w-3xl gap-x-2 px-4">
            <Opcion href={`/aventuras/${aventura[1]}`} activa={!aventura[2]}>Editar</Opcion>
            <Opcion href={`/aventuras/${aventura[1]}/rejilla`} activa={!!aventura[2]}>Rejilla</Opcion>
          </div>
        </nav>
      )}
    </header>
  );
}
