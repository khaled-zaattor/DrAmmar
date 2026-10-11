import { useSyncExternalStore } from "react";
import { createPwaInstallStore } from "@/lib/pwa-install";

// The store is created lazily rather than at module scope. Building it eagerly
// meant `window` was dereferenced the moment anything imported this file, which
// crashed server-side rendering through the chain
// BookingSection → InstallAppCard → here. Nothing needs the store until a
// browser calls one of the exports below, and by then `window` exists.
let store: ReturnType<typeof createPwaInstallStore> | undefined;

const getStore = () => (store ??= createPwaInstallStore(window));

export const initializePwaInstall = () => getStore().start();

export function usePwaInstall() {
  const s = getStore();
  const state = useSyncExternalStore(s.subscribe, s.getSnapshot);
  return { ...state, install: s.install, dismiss: s.dismiss };
}
