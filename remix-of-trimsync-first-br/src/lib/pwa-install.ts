export type InstallPlatform = "ios" | "android" | "other";

type InstallChoice = { outcome: "accepted" | "dismissed" };
export interface InstallPromptEvent extends Event {
  prompt: () => Promise<InstallChoice | void>;
  userChoice: Promise<InstallChoice>;
}

interface InstallState {
  platform: InstallPlatform;
  canInstall: boolean;
  isInstalled: boolean;
  isDismissed: boolean;
  isInstalling: boolean;
  installError: boolean;
}

const DISMISS_KEY = "alis-pwa-dismissed";

// Capture install availability for the whole visit, before confirmation mounts.
// Nothing is installed until the customer presses the confirmation card's button.
export function createPwaInstallStore(browser: Window) {
  let state: InstallState = {
    platform: "other",
    canInstall: false,
    isInstalled: false,
    isDismissed: false,
    isInstalling: false,
    installError: false,
  };
  let deferredPrompt: InstallPromptEvent | null = null;
  let stop: (() => void) | undefined;
  const listeners = new Set<() => void>();
  const update = (patch: Partial<InstallState>) => {
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  };

  const dismiss = () => {
    try {
      browser.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Private browsers can refuse storage; dismissal still works in memory.
    }
    update({ isDismissed: true });
  };

  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    start() {
      if (stop) return stop;
      const navigator = browser.navigator as Navigator & { standalone?: boolean };
      const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
        || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      const platform = ios ? "ios" : /Android/i.test(navigator.userAgent) ? "android" : "other";
      const standalone = browser.matchMedia("(display-mode: standalone)");
      let isDismissed = state.isDismissed;
      try {
        isDismissed ||= browser.sessionStorage.getItem(DISMISS_KEY) === "1";
      } catch { /* Storage is optional. */ }
      update({ platform, isDismissed, isInstalled: standalone.matches || navigator.standalone === true });

      const onPrompt = (event: Event) => {
        if (state.platform !== "android") return;
        event.preventDefault();
        if (state.isInstalled) return;
        deferredPrompt = event as InstallPromptEvent;
        update({ canInstall: true, installError: false });
      };
      const onInstalled = () => {
        deferredPrompt = null;
        update({ isInstalled: true, canInstall: false, isInstalling: false, installError: false });
      };
      const onDisplayMode = () => {
        if (standalone.matches || navigator.standalone) onInstalled();
      };
      browser.addEventListener("beforeinstallprompt", onPrompt);
      browser.addEventListener("appinstalled", onInstalled);
      standalone.addEventListener("change", onDisplayMode);
      stop = () => {
        browser.removeEventListener("beforeinstallprompt", onPrompt);
        browser.removeEventListener("appinstalled", onInstalled);
        standalone.removeEventListener("change", onDisplayMode);
        deferredPrompt = null;
        stop = undefined;
      };
      return stop;
    },
    dismiss,
    async install() {
      if (!deferredPrompt || state.isInstalling || state.isInstalled || state.isDismissed) return;
      const promptEvent = deferredPrompt;
      deferredPrompt = null; // Each event is usable only once.
      update({ isInstalling: true, installError: false });
      try {
        // Keep this call before any await: the browser requires a user gesture.
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        update({ canInstall: false, isInstalling: false });
        if (choice.outcome === "dismissed") dismiss();
        // Acceptance is not installation confirmation; appinstalled handles that.
      } catch {
        update({ canInstall: false, isInstalling: false, installError: !state.isInstalled });
      }
    },
  };
}
