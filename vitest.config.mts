import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),

      /* In Next, "server-only" se rezolva la un modul gol cand codul ruleaza pe
         server. Vitest nu foloseste conditia "react-server", deci ar lua
         varianta care arunca eroare. Il trimitem direct la cea goala. */
      "server-only": fileURLToPath(
        new URL("./node_modules/server-only/empty.js", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    /* Verificarile cu cereri reale catre AI se ruleaza separat, cu
       `npm run smoke:ai`. Nu au ce cauta in CI: consuma cota si depind de un
       serviciu extern. */
    exclude: ["**/node_modules/**", "**/*.live.test.ts"],
  },
});
