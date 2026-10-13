import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import Navegacion from "@/components/Navegacion";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import "./globals.css";

const fuente = Nunito({ subsets: ["latin"], display: "swap", variable: "--fuente" });

export const metadata: Metadata = {
  title: "QR Quest",
  description: "Crea aventuras con códigos QR y contraseñas para jugar en familia o con amigos.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = crearClienteServidor();
  const { data } = await supabase.auth.getUser();

  return (
    <html lang="es-ES" className={fuente.variable}>
      <body className="min-h-screen bg-papel font-sans text-tinta antialiased">
        <Navegacion haySesion={!!data.user} />
        <div className="mx-auto w-full max-w-3xl px-4 py-6">{children}</div>
      </body>
    </html>
  );
}
