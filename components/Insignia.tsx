type Variante = "exito" | "peligro" | "aviso" | "neutra";

const estilos: Record<Variante, string> = {
  exito: "border-exito bg-exito-suave text-exito",
  peligro: "border-peligro bg-peligro-suave text-peligro",
  aviso: "border-acento bg-acento-suave text-tinta",
  neutra: "border-borde bg-superficie text-tinta-suave",
};

export default function Insignia({
  variante,
  icono,
  children,
}: {
  variante: Variante;
  icono?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${estilos[variante]}`}>
      {icono && <span aria-hidden="true">{icono}</span>}
      {children}
    </span>
  );
}
