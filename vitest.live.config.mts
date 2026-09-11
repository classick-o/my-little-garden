import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Configurare pentru verificarile care fac cereri reale catre AI.
 *
 *   npm run smoke:ai
 *
 * Scrisa separat, nu derivata din vitest.config.mts: `mergeConfig` concateneaza
 * listele, deci excluderea fisierelor *.live.test.ts din configurarea de baza
 * ar ramane activa si nu s-ar rula nimic.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(
        new URL("./node_modules/server-only/empty.js", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.live.test.ts"],
    /* O cerere reala dureaza zeci de secunde; nu le pornim in paralel, ca sa nu
       lovim limita de cereri pe minut. */
    fileParallelism: false,
  },
});
