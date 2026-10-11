import { lazy, type ComponentType } from "react";

/**
 * A dynamic `import()` can fail for two very different reasons:
 *
 *   1. The network dropped the request. Common on a weak mobile connection —
 *      the chunk is still on the server, so asking again usually works.
 *   2. The chunk is gone. Every build stamps a new hash into the file name, so
 *      a tab that loaded before a deploy asks for a file the deploy deleted.
 *      Retrying that URL can never succeed; only fresh HTML can.
 *
 * Both surface as the same rejection, so we retry a few times with backoff and
 * fall back to a single reload, which picks up the current build's file names.
 */

const RELOAD_KEY = "chunk-reload-at";
const RELOAD_COOLDOWN_MS = 60_000;

const CHUNK_ERROR_PATTERN =
  /dynamically imported module|importing a module script failed|failed to fetch|load failed|error loading/i;

export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return CHUNK_ERROR_PATTERN.test(message);
}

export interface LoadOptions {
  /** Extra attempts after the first one. */
  retries?: number;
  /** First backoff step; each further wait doubles it. */
  baseDelayMs?: number;
  sleep?: (ms: number) => Promise<void>;
  reload?: () => void;
  storage?: Pick<Storage, "getItem" | "setItem"> | null;
  now?: () => number;
}

const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

function defaultStorage(): Pick<Storage, "getItem" | "setItem"> | null {
  try {
    return window.sessionStorage;
  } catch {
    // Storage is blocked in some privacy modes; the loader still works without it.
    return null;
  }
}

/**
 * Returns true at most once per cooldown, so a server that really is missing
 * the file cannot put the page into a reload loop.
 */
function claimReload(
  storage: Pick<Storage, "getItem" | "setItem"> | null,
  now: number,
): boolean {
  if (!storage) return true;
  try {
    const previous = Number(storage.getItem(RELOAD_KEY));
    if (previous && now - previous < RELOAD_COOLDOWN_MS) return false;
    storage.setItem(RELOAD_KEY, String(now));
    return true;
  } catch {
    return true;
  }
}

export function loadModule<T>(
  factory: () => Promise<T>,
  options: LoadOptions = {},
): Promise<T> {
  const {
    retries = 2,
    baseDelayMs = 700,
    sleep = defaultSleep,
    reload = () => window.location.reload(),
    storage = defaultStorage(),
    now = Date.now,
  } = options;

  const attempt = async (n: number): Promise<T> => {
    try {
      return await factory();
    } catch (error) {
      if (!isChunkLoadError(error)) throw error;

      if (n < retries) {
        await sleep(baseDelayMs * 2 ** n);
        return attempt(n + 1);
      }

      if (claimReload(storage, now())) {
        reload();
        // The page is navigating away; never settle, so nothing renders an
        // error state during the teardown.
        return new Promise<T>(() => {});
      }

      throw error;
    }
  };

  return attempt(0);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- mirrors React.lazy's own signature
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  options?: LoadOptions,
) {
  return lazy(() => loadModule(factory, options));
}
