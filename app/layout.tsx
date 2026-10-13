import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QR Quest",
  description: "Crea aventuras con códigos QR y contraseñas para jugar en familia o con amigos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-ES">
      <body className="min-h-screen bg-amber-50 text-slate-800 antialiased">
        <div className="mx-auto w-full max-w-3xl px-4 py-6">{children}</div>
      </body>
    </html>
  );
}
