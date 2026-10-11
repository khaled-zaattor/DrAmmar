import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from "react";
import { hydrateRoot, createRoot } from "react-dom/client";
import { AppProviders, createQueryClient } from "@/app-root";
import { findRoute } from "@/routes";
import NotFound from "@/pages/NotFound";
import ClientOnly from "@/components/ClientOnly";
import { loadModule } from "@/lib/lazy-retry";
import { initializePwaInstall } from "@/hooks/use-pwa-install";
import "./index.css";

const stopPwaInstall = initializePwaInstall();
if (import.meta.hot) import.meta.hot.dispose(stopPwaInstall);

const Toaster = lazy(() =>
  loadModule(() => import("@/components/ui/toaster")).then(
    (module) => ({ default: module.Toaster }),
    // Toasts are a nicety; never let a missing chunk take the page down.
    () => ({ default: () => null })
  )
);

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("React crash:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: "monospace", color: "red" }}>
          <strong>App crashed — check console (F12) for details:</strong>
          <pre style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>
            {(this.state.error as Error).message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const route = findRoute(window.location.pathname);
const client = createQueryClient();

const tree = (
  <ErrorBoundary>
    <AppProviders client={client}>
      {route ? route.element : <NotFound />}
      <ClientOnly>
        <Suspense fallback={null}>
          <Toaster />
        </Suspense>
      </ClientOnly>
    </AppProviders>
  </ErrorBoundary>
);

const container = document.getElementById("root")!;

// In production the container holds prerendered markup, so hydrate it. In dev
// (and for the 404 fallback) there is nothing to hydrate, so mount normally.
if (route && container.hasChildNodes()) {
  hydrateRoot(container, tree);
} else {
  createRoot(container).render(tree);
}
