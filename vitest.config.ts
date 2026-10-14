import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // `server-only` lanza un error fuera de Next; en las pruebas se sustituye por un módulo vacío
  resolve: {
    alias: { "server-only": fileURLToPath(new URL("./tests/unit/minijuegos/server-only-vacio.ts", import.meta.url)) },
  },
  test: { environment: "node", include: ["tests/unit/**/*.test.ts"] },
});
