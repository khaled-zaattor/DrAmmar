import { describe, expect, it, vi } from "vitest";
import { isChunkLoadError, loadModule } from "./lazy-retry";

const chunkError = () =>
  new Error(
    "Failed to fetch dynamically imported module: https://www.alisbarbershop.com/assets/TestimonialsSection-DnLb_5-b.js",
  );

function harness(overrides: Parameters<typeof loadModule>[1] = {}) {
  const reload = vi.fn();
  const sleep = vi.fn().mockResolvedValue(undefined);
  const store = new Map<string, string>();
  const storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
  };
  return { reload, sleep, storage, options: { reload, sleep, storage, ...overrides } };
}

describe("chunk loading on a weak connection", () => {
  it("recovers when a retry of the same chunk succeeds", async () => {
    const { options, sleep, reload } = harness();
    const factory = vi
      .fn()
      .mockRejectedValueOnce(chunkError())
      .mockResolvedValueOnce({ default: "Testimonials" });

    await expect(loadModule(factory, options)).resolves.toEqual({
      default: "Testimonials",
    });
    expect(factory).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledWith(700);
    expect(reload).not.toHaveBeenCalled();
  });

  it("backs off further with each attempt", async () => {
    const { options, sleep } = harness();
    const factory = vi.fn().mockRejectedValue(chunkError());

    void loadModule(factory, options);
    await vi.waitFor(() => expect(sleep).toHaveBeenCalledTimes(2));

    expect(sleep.mock.calls.map(([ms]) => ms)).toEqual([700, 1400]);
  });

  it("reloads once the chunk is proven unreachable, since a deploy may have replaced it", async () => {
    const { options, reload } = harness();
    const factory = vi.fn().mockRejectedValue(chunkError());

    const pending = loadModule(factory, options);
    await vi.waitFor(() => expect(reload).toHaveBeenCalledTimes(1));

    expect(factory).toHaveBeenCalledTimes(3);
    // Stays pending so React renders nothing while the page navigates away.
    await expect(
      Promise.race([pending, Promise.resolve("still-pending")]),
    ).resolves.toBe("still-pending");
  });

  it("gives up rather than reloading twice in a row", async () => {
    const { options, reload, storage } = harness();
    storage.setItem("chunk-reload-at", String(Date.now()));
    const error = chunkError();

    await expect(
      loadModule(vi.fn().mockRejectedValue(error), options),
    ).rejects.toBe(error);
    expect(reload).not.toHaveBeenCalled();
  });

  it("leaves unrelated failures alone", async () => {
    const { options, reload, sleep } = harness();
    const error = new TypeError("component threw during evaluation");

    await expect(
      loadModule(vi.fn().mockRejectedValue(error), options),
    ).rejects.toBe(error);
    expect(sleep).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
  });
});

describe("isChunkLoadError", () => {
  it.each([
    "Failed to fetch dynamically imported module: /assets/Footer-ed7fttn5.js",
    "error loading dynamically imported module",
    "Importing a module script failed.",
    "Load failed",
  ])("recognises %s", (message) => {
    expect(isChunkLoadError(new Error(message))).toBe(true);
  });

  it("ignores an ordinary runtime error", () => {
    expect(isChunkLoadError(new Error("x is not a function"))).toBe(false);
  });
});
