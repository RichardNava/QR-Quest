import Link from "next/link";
import CerrarSesion from "@/components/CerrarSesion";

export default function AventurasLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="no-imprimir mb-6 flex items-center justify-between gap-3 border-b border-amber-200 pb-3">
        <Link href="/aventuras" className="text-xl font-extrabold text-indigo-700">QR Quest</Link>
        <nav className="flex items-center gap-3">
          <Link href="/aventuras" className="text-sm underline">Mis aventuras</Link>
          <CerrarSesion />
        </nav>
      </header>
      {children}
    </>
  );
}
