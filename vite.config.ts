import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const backendUrl =
    env.VITE_BACKEND_URL || env.BACKEND_URL || "http://localhost:3000";

  return {
    server: {
      // Keep client dev server separate from the API server.
      port: 5173,
      strictPort: true,
      host: "0.0.0.0",
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
    plugins: [react()],
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) {
              return;
            }

            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("scheduler")
            ) {
              return "react-vendor";
            }

            if (id.includes("lucide-react")) {
              return "icons-vendor";
            }

            if (id.includes("motion")) {
              return "motion-vendor";
            }

            if (id.includes("react-markdown")) {
              return "markdown-vendor";
            }
          },
        },
      },
    },
  };
});
