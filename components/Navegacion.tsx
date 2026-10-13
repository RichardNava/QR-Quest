"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CerrarSesion from "./CerrarSesion";

const enlaceBase =
  "inline-flex min-h-[44px] items-center border-b-4 px-2 text-sm text-superficie hover:text-acento-suave focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acento";

function Opcion({ href, activa, children }: { href: string; activa: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={activa ? "page" : undefined}
      className={`${enlaceBase} ${activa ? "border-acento font-extrabold" : "border-transparent font-medium"}`}
    >
      {children}
    </Link>
  );
}

export default function Navegacion({ haySesion }: { haySesion: boolean }) {
  const ruta = usePathname() ?? "/";
  const marca = (
    <Link
      href="/"
      className="inline-flex min-h-[44px] items-center text-xl font-extrabold text-superficie focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acento"
    >
      QR Quest
    </Link>
  );

  // El jugador solo ve la marca
  if (ruta.startsWith("/p/")) {
    return (
      <header className="no-imprimir bg-marca-oscura">
        <div className="mx-auto flex max-w-3xl items-center px-4">{marca}</div>
      </header>
    );
  }

  const aventura = ruta.match(/^\/aventuras\/([^/]+)(\/rejilla)?\/?$/);

  return (
    <header className="no-imprimir bg-marca-oscura">
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
        <nav aria-label="De la aventura" className="border-t border-superficie/20 bg-marca">
          <div className="mx-auto flex max-w-3xl gap-x-2 px-4">
            <Opcion href={`/aventuras/${aventura[1]}`} activa={!aventura[2]}>Editar</Opcion>
            <Opcion href={`/aventuras/${aventura[1]}/rejilla`} activa={!!aventura[2]}>Rejilla</Opcion>
          </div>
        </nav>
      )}
    </header>
  );
}
