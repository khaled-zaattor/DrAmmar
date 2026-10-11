import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPwaInstallStore, type InstallPromptEvent } from "./pwa-install";

const android = "Mozilla/5.0 (Linux; Android 14) Chrome/130 Mobile Safari/537.36";
let cleanup: (() => void) | undefined;
const touchPointsDescriptor = Object.getOwnPropertyDescriptor(window.navigator, "maxTouchPoints");

function start(userAgent = android, standalone = false) {
  vi.spyOn(window.navigator, "userAgent", "get").mockReturnValue(userAgent);
  vi.spyOn(window, "matchMedia").mockReturnValue({
    matches: standalone,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as MediaQueryList);
  const store = createPwaInstallStore(window);
  cleanup = store.start();
  return store;
}

function offer(outcome: "accepted" | "dismissed" = "accepted") {
  const event = new Event("beforeinstallprompt", { cancelable: true }) as InstallPromptEvent;
  event.prompt = vi.fn().mockResolvedValue({ outcome });
  event.userChoice = Promise.resolve({ outcome });
  window.dispatchEvent(event);
  return event;
}

beforeEach(() => window.sessionStorage.clear());
afterEach(() => {
  cleanup?.();
  vi.restoreAllMocks();
  if (touchPointsDescriptor) Object.defineProperty(window.navigator, "maxTouchPoints", touchPointsDescriptor);
  else Reflect.deleteProperty(window.navigator, "maxTouchPoints");
});

describe("PWA installation lifecycle", () => {
  it("retains an early offer, but prompts only from the later install action", async () => {
    const store = start();
    const event = offer();
    expect(event.defaultPrevented).toBe(true);
    expect(event.prompt).not.toHaveBeenCalled();
    expect(store.getSnapshot().canInstall).toBe(true);
    const installing = store.install();
    // It must be called synchronously to retain the button's user activation.
    expect(event.prompt).toHaveBeenCalledTimes(1);
    await Promise.all([installing, store.install()]);
    expect(event.prompt).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot()).toMatchObject({ canInstall: false, isInstalling: false, isInstalled: false });
    window.dispatchEvent(new Event("appinstalled"));
    expect(store.getSnapshot().isInstalled).toBe(true);
  });

  it("handles a native dismissal and remembers Maybe later for this session", async () => {
    const store = start();
    offer("dismissed");
    await store.install();
    expect(store.getSnapshot().isDismissed).toBe(true);
    cleanup?.();
    const nextVisit = start();
    expect(nextVisit.getSnapshot().isDismissed).toBe(true);
    const event = offer();
    await nextVisit.install();
    expect(event.prompt).not.toHaveBeenCalled();
  });

  it("survives an installation error and can use a fresh browser offer", async () => {
    const store = start();
    const event = offer();
    vi.mocked(event.prompt).mockRejectedValue(new Error("Unavailable"));
    await store.install();
    expect(store.getSnapshot()).toMatchObject({ installError: true, isInstalling: false, canInstall: false });
    const freshEvent = offer();
    await store.install();
    expect(freshEvent.prompt).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot().installError).toBe(false);
  });

  it("recognizes iPhone and iPad desktop mode", () => {
    const iphone = start("Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X)");
    expect(iphone.getSnapshot().platform).toBe("ios");
    expect(offer().defaultPrevented).toBe(false);
    cleanup?.();
    vi.spyOn(window.navigator, "platform", "get").mockReturnValue("MacIntel");
    Object.defineProperty(window.navigator, "maxTouchPoints", { configurable: true, get: () => 5 });
    const ipad = start("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)");
    expect(ipad.getSnapshot().platform).toBe("ios");
  });

  it("suppresses installed apps and does not intercept desktop browser offers", () => {
    const installed = start(android, true);
    offer();
    expect(installed.getSnapshot()).toMatchObject({ isInstalled: true, canInstall: false });
    cleanup?.();
    const desktop = start("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
    expect(desktop.getSnapshot().platform).toBe("other");
    expect(offer().defaultPrevented).toBe(false);
  });

  it("still works when browser storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Blocked"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Blocked"); });
    const store = start();
    expect(() => store.dismiss()).not.toThrow();
    expect(store.getSnapshot().isDismissed).toBe(true);
  });
});
