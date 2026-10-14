"use client";

import { useState, useTransition } from "react";
import { probarCodigo, resolverMinijuego } from "@/app/p/[token]/actions";
import { NOMBRES_NIVEL, NOMBRES_TIPO } from "@/lib/minijuegos/config";
import type { Nivel, PistasMastermind, TipoMinijuego, Vista } from "@/lib/minijuegos/tipos";
import { apoyo, aviso, botonSecundario, titulo2 } from "../estilos";
import Insignia from "../Insignia";
import Laberinto from "./Laberinto";
import LightsOut from "./LightsOut";
import Mastermind from "./Mastermind";
import RushHour from "./RushHour";
import Sudoku from "./Sudoku";

const REGLAS: Record<TipoMinijuego, string> = {
  rushhour:
    "Saca tu pieza de la caja. Toca un vehículo para elegirlo y muévelo con las flechas, pero solo puede deslizarse en línea recta y sin chocar con otros. Cuando tu pieza llegue a la salida, el juego estará resuelto.",
  lightsout:
    "Apaga todas las luces. Al tocar una casilla, cambian ella y las cuatro que la rodean (arriba, abajo, izquierda y derecha): las encendidas se apagan y las apagadas se encienden.",
  mastermind:
    "Adivina el código secreto. Elige una combinación de símbolos y pulsa «Probar combinación»: te diremos cuántos símbolos están en su sitio y cuántos están en el código pero en otro sitio.",
  sudoku:
    "Rellena la cuadrícula con los números del 1 al 9 sin repetir ninguno en cada fila, columna ni bloque de 3×3. Las casillas en negrita ya vienen dadas y no se pueden cambiar.",
  laberinto:
    "Lleva la ficha ● hasta la meta ★. Muévela con los botones o con las flechas del teclado; no se pueden atravesar las paredes.",
};

type Props = { tipo: TipoMinijuego; nivel: Nivel; vista: Vista; token: string };

export default function Minijuego({ tipo, nivel, vista, token }: Props) {
  const [partida, setPartida] = useState(0); // al cambiar, el tablero se reinicia
  const [contrasena, setContrasena] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [pendiente, empezar] = useTransition();
  const resuelto = contrasena !== null;
  const bloqueado = resuelto || pendiente;

  function alTerminar(respuesta: unknown) {
    setMensaje("");
    empezar(async () => {
      const r = await resolverMinijuego(token, respuesta);
      if (r.ok) setContrasena(r.contrasena);
      else setMensaje(r.mensaje);
    });
  }

  async function probar(codigo: number[]): Promise<PistasMastermind | { contrasena: string }> {
    const r = await probarCodigo(token, codigo);
    if (!r.ok) throw new Error(r.mensaje);
    if (r.resuelto) {
      setContrasena(r.contrasena);
      return { contrasena: r.contrasena };
    }
    return r.pistas;
  }

  function reiniciar() {
    setContrasena(null);
    setMensaje("");
    setPartida((n) => n + 1);
  }

  return (
    <section className="space-y-3 rounded-lg border-2 border-borde bg-papel p-4" aria-label={`Minijuego: ${NOMBRES_TIPO[tipo]}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className={titulo2}>
          {NOMBRES_TIPO[tipo]} <span className="text-base normal-case text-tinta-suave">· {NOMBRES_NIVEL[nivel]}</span>
        </h2>
        {resuelto ? (
          <Insignia variante="exito" icono="✓">¡Resuelto!</Insignia>
        ) : (
          <Insignia variante="aviso" icono="…">Sin resolver</Insignia>
        )}
      </div>
      <details className="rounded-lg border border-borde bg-superficie px-3 py-2" open>
        <summary className="cursor-pointer text-sm font-semibold text-tinta">Cómo se juega</summary>
        <p className={`${apoyo} mt-1`}>{REGLAS[tipo]}</p>
      </details>

      <div key={partida}>
        {vista.tipo === "laberinto" && <Laberinto vista={vista} alTerminar={alTerminar} bloqueado={bloqueado} />}
        {vista.tipo === "lightsout" && <LightsOut vista={vista} alTerminar={alTerminar} bloqueado={bloqueado} />}
        {vista.tipo === "rushhour" && <RushHour vista={vista} alTerminar={alTerminar} bloqueado={bloqueado} />}
        {vista.tipo === "sudoku" && <Sudoku vista={vista} alTerminar={alTerminar} bloqueado={bloqueado} />}
        {vista.tipo === "mastermind" && <Mastermind vista={vista} probar={probar} bloqueado={resuelto} />}
      </div>

      {mensaje && (
        <p className={aviso} role="alert">
          <span aria-hidden="true">✕ </span>
          {mensaje}
        </p>
      )}
      {resuelto && (
        <div className="rounded-lg border-2 border-exito bg-exito-suave p-4 text-center" role="status">
          <p className="text-sm font-semibold text-exito">¡Lo has conseguido! La contraseña es:</p>
          <p className="my-2 break-all text-3xl font-extrabold text-tinta">{contrasena}</p>
          <p className="text-sm text-tinta">Escríbela en el campo «Contraseña» de abajo para ver la recompensa.</p>
        </div>
      )}
      <button type="button" className={botonSecundario} onClick={reiniciar}>
        Reiniciar
      </button>
    </section>
  );
}
