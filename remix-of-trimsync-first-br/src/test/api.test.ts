import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, HttpError, NetworkError, TimeoutError } from "@/lib/api";

// Regression coverage for the intermittent shared-host failure
// "Failed to load services: signal is aborted without reason".
// The abort came from api.ts's own 6s AbortController, and abort() with no
// argument surfaces that DOMException text straight to the user.

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

describe("api read requests", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("does not send Content-Type on GET, so the request stays preflight-free", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse({ data: [] }));

    await api.getServices();

    const headers = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers).toHaveProperty("Accept", "application/json");
    // Content-Type is not CORS-safelisted; on a bodyless GET it only buys an
    // extra OPTIONS round trip against the API.
    expect(headers).not.toHaveProperty("Content-Type");
  });

  it("reports a timeout in human language, never the raw DOMException text", async () => {
    // A request that never settles — what a saturated shared host looks like.
    vi.spyOn(globalThis, "fetch").mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            // Mirrors Safari < 16.4, which ignores abort()'s reason argument and
            // rejects with the bare DOMException the user was seeing.
            reject(new DOMException("signal is aborted without reason", "AbortError"))
          );
        })
    );

    const captured: Promise<Error> = api
      .getServices()
      .then(() => new Error("expected getServices to reject"))
      .catch((err: Error) => err);

    // Exhaust the timeout plus both retry backoffs.
    await vi.advanceTimersByTimeAsync(60_000);
    const err = await captured;

    expect(err).toBeInstanceOf(TimeoutError);
    // The exact string from the original bug report.
    expect(err.message).not.toContain("signal is aborted");
    expect(err.message).toBe("The server took too long to respond. Please try again.");
  });

  it("retries a transient 503 and succeeds", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("{}", { status: 503 }))
      .mockResolvedValueOnce(jsonResponse({ data: [{ id: 1, name: "Fade" }] }));

    const pending = api.getServices();
    await vi.advanceTimersByTimeAsync(5_000);

    await expect(pending).resolves.toEqual([{ id: 1, name: "Fade" }]);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("does not retry a 422 — it would fail identically and waste a worker", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "Validation failed." }), { status: 422 })
    );

    const pending = api.getServices();
    const assertion = expect(pending).rejects.toBeInstanceOf(HttpError);
    await vi.advanceTimersByTimeAsync(10_000);
    await assertion;

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("surfaces a network failure as NetworkError", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));

    const pending = api.getServices();
    const assertion = expect(pending).rejects.toThrow(NetworkError);
    await vi.advanceTimersByTimeAsync(10_000);
    await assertion;
  });
});
