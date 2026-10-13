import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import Navegacion from "@/components/Navegacion";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import "./globals.css";

const fuente = Inter({ subsets: ["latin"], display: "swap", variable: "--fuente" });
const fuenteTitulo = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--fuente-titulo",
});

export const metadata: Metadata = {
  title: "QR Quest",
  description: "Crea aventuras con códigos QR y contraseñas para jugar en familia o con amigos.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = crearClienteServidor();
  const { data } = await supabase.auth.getUser();

  return (
    <html lang="es-ES" className={`${fuente.variable} ${fuenteTitulo.variable}`}>
      <body className="min-h-screen font-sans text-tinta antialiased">
        <Navegacion haySesion={!!data.user} />
        <div className="mx-auto w-full max-w-3xl px-4 py-8">{children}</div>
      </body>
    </html>
  );
}
