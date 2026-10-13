import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function crearClienteServidor() {
  const almacen = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => almacen.getAll(),
        setAll: (lista) => {
          try {
            lista.forEach(({ name, value, options }) => almacen.set(name, value, options));
          } catch {
            // Llamado desde un componente de servidor: el middleware refresca la sesión
          }
        },
      },
    }
  );
}
