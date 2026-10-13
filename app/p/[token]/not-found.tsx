import Link from "next/link";
import { enlace, titulo1 } from "@/components/estilos";

export default function PuzzleNoEncontrado() {
  return (
    <main className="space-y-3 py-10 text-center">
      <h1 className={titulo1}>Este puzzle ya no existe</h1>
      <p>Puede que el master lo haya borrado o que la dirección no sea correcta.</p>
      <Link href="/" className={enlace}>Ir a la portada</Link>
    </main>
  );
}
