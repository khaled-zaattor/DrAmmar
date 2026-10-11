import { useSyncExternalStore, type ReactNode } from "react";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Renders children only in the browser, never during prerendering and never on
 * the hydration pass.
 *
 * useSyncExternalStore with a server snapshot of `false` is the one pattern
 * React guarantees will not produce a hydration warning: the server render and
 * the first client render both see `false`, and the switch to `true` happens in
 * a committed update rather than during hydration.
 *
 * Wrapping the booking widget in this also fixes an SSR crash for free — the
 * React.lazy factory underneath never executes on the server, so the module
 * chain that reaches `window` at import time is never loaded there.
 *
 * Only use this for interactive machinery with no SEO value. Anything a crawler
 * should read must render on the server.
 */
const ClientOnly = ({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) => {
  const isClient = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  return <>{isClient ? children : fallback}</>;
};

export default ClientOnly;
