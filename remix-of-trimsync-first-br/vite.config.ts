import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

/**
 * The app has one small, global stylesheet. Inlining it avoids an extra
 * render-blocking round trip without making any JavaScript responsible for
 * applying styles.
 */
function inlineStylesheet(): Plugin {
  return {
    name: "inline-stylesheet",
    apply: "build",
    enforce: "post",
    generateBundle(_options, bundle) {
      for (const output of Object.values(bundle)) {
        if (output.type !== "asset" || !output.fileName.endsWith(".html")) {
          continue;
        }

        let html = String(output.source);
        html = html.replace(
          /<link\s+rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/g,
          (tag, href: string) => {
            const css = Object.values(bundle).find(
              (candidate) =>
                candidate.type === "asset" &&
                candidate.fileName.endsWith(href.replace(/^\//, "")),
            );

            if (!css || css.type !== "asset") return tag;

            const source =
              typeof css.source === "string"
                ? css.source
                : new TextDecoder().decode(css.source);
            delete bundle[css.fileName];
            return `<style data-inline-critical-css>${source}</style>`;
          },
        );
        output.source = html;
      }
    },
  };
}
// https://vitejs.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  build: {
    // The SSR bundle is a throwaway intermediate consumed by
    // scripts/prerender.mjs. Without this it would also copy all of public/ into
    // .ssr-build, which is pure waste.
    copyPublicDir: !isSsrBuild,
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,
      },
      "/storage": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react(), inlineStylesheet()],
  define: {
    // Baked at build time so the footer copyright year is identical in the
    // prerendered HTML and on the client. Computing it in the render body meant
    // a visitor hydrating after New Year got a hydration mismatch.
    __BUILD_YEAR__: new Date().getFullYear(),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
