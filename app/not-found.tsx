import Link from "next/link";
import { enlace, titulo1 } from "@/components/estilos";

export default function NoEncontrado() {
  return (
    <main className="space-y-3 py-10 text-center">
      <h1 className={titulo1}>Página no encontrada</h1>
      <p>No hemos encontrado lo que buscabas.</p>
      <Link href="/" className={enlace}>Ir a la portada</Link>
    </main>
  );
}
