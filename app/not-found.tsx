import Link from "next/link";
import { enlace } from "@/components/estilos";

export default function NoEncontrado() {
  return (
    <main className="space-y-3 py-10 text-center">
      <h1 className="text-2xl font-bold">Página no encontrada</h1>
      <p>No hemos encontrado lo que buscabas.</p>
      <Link href="/" className={enlace}>Ir a la portada</Link>
    </main>
  );
}
