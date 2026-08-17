const BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : "/api";

// ─── Errors ───────────────────────────────────────────────────────────────────
// TimeoutError/NetworkError messages are written for humans and are safe to
// show directly. HttpError messages come from Laravel and may contain field
// names, so the UI should not surface them verbatim.

export class TimeoutError extends Error {
  constructor(
    message = "The server took too long to respond. Please try again."
  ) {
    super(message);
    this.name = "TimeoutError";
  }
}

export class NetworkError extends Error {
  constructor(
    message = "Couldn't reach the server. Please check your connection and try again."
  ) {
    super(message);
    this.name = "NetworkError";
  }
}

export class HttpError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "HttpError";
  }
}

// Accept is a CORS-safelisted request header, so GETs using only this do NOT
// trigger a preflight. Never add Content-Type here: it is not safelisted, and
// on a bodyless GET it buys nothing while doubling every request into
// OPTIONS + GET against a shared host.
const GET_HEADERS: HeadersInit = {
  Accept: "application/json",
};

// For requests that actually send a JSON body. These do preflight, which is
// unavoidable — config/cors.php max_age keeps it from repeating.
const JSON_HEADERS: HeadersInit = {
  ...GET_HEADERS,
  "Content-Type": "application/json",
};

function authHeaders(withBody = false): HeadersInit {
  const token = localStorage.getItem("auth_token");
  const base = withBody ? JSON_HEADERS : GET_HEADERS;
  return token ? { ...base, Authorization: `Bearer ${token}` } : base;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const fieldErrors = body?.errors
      ? Object.entries(body.errors as Record<string, string[]>)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join(" | ")
      : null;
    const message =
      fieldErrors || body?.message || `Request failed (${res.status})`;
    console.error("API error body:", body);
    throw new HttpError(message, res.status);
  }
  return res.json();
}

// Handles all three shapes Laravel returns:
//   plain array
//   { data: [...] }            — simple resource
//   { data: { data: [...] } }  — paginated resource
function extractArray<T>(body: unknown): T[] {
  if (Array.isArray(body)) return body as T[];
  if (body && typeof body === "object") {
    const inner = (body as Record<string, unknown>).data;
    if (Array.isArray(inner)) return inner as T[];
    if (inner && typeof inner === "object") {
      const nested = (inner as Record<string, unknown>).data;
      if (Array.isArray(nested)) return nested as T[];
    }
  }
  return [];
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Service {
  id: number;
  name: string;
  price?: string | number;
  duration_minutes?: number;
  description?: string;
  image?: string | null;
  image_url?: string | null;
  category_id?: number | null;
  category?: { id: number; name: string } | null;
}

export interface ServiceCategory {
  id: number;
  name: string;
  description?: string | null;
  sort_order: number;
  is_active: boolean;
  services_count?: number;
}

export interface TopService {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  duration_minutes: number;
  booking_count: number;
  image_url?: string | null;
  is_active: boolean;
}

export interface BusinessHours {
  day_of_week: number;      // 0=Sun … 6=Sat
  open_time: string | null; // "08:30:00" or null when closed
  close_time: string | null;
  is_closed: boolean;
  slot_duration: number;
}

export interface Barber {
  id: number;
  name: string;
  title?: string;
  bio?: string;
  image_url?: string | null;
  services?: Pick<Service, "id" | "name" | "price" | "duration_minutes">[];
}

export interface AppointmentPayload {
  service_ids: number[];
  barber_id: number;
  appointment_date: string;
  appointment_time: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes?: string;
}

export interface AppointmentResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    booking_reference: string;
    customer_name: string;
    customer_email: string;
    appointment_date: string;
    appointment_time: string;
    duration_minutes: number;
    total_price: number;
    status: string;
    barber: { id: number; name: string };
    service: { id: number; name: string; duration_minutes: number; price: string } | null;
    services: { id: number; name: string; duration_minutes: number; price: string }[];
  };
}

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Read requests get a generous ceiling — this is a give-up bound, not an
// expected latency. Shared hosting can stall for seconds under a cold PHP boot.
const DEFAULT_TIMEOUT_MS = 12_000;
const RETRY_DELAYS_MS = [500, 1500]; // 2 retries => 3 attempts max

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const ctrl = new AbortController();
  const reason = new TimeoutError();
  const timer = setTimeout(() => ctrl.abort(reason), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: ctrl.signal });
  } catch (err) {
    // Two paths converge here:
    //   modern browsers reject with our `reason`
    //   Safari < 16.4 ignores abort()'s argument and rejects with a bare
    //   AbortError DOMException — the "signal is aborted without reason" text
    // Checking signal.aborted normalises both so that string can never surface.
    if (ctrl.signal.aborted) throw reason;
    if (err instanceof TypeError) throw new NetworkError(); // offline / DNS / CORS-blocked
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// Retry transient failures only. A 4xx will fail identically on a retry and
// would just burn scarce PHP workers.
function isRetryable(err: unknown): boolean {
  if (err instanceof TimeoutError || err instanceof NetworkError) return true;
  if (err instanceof HttpError) return [429, 502, 503, 504].includes(err.status);
  return false;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Single retry layer for the app — react-query is configured with retry: 0 so
// attempts don't multiply across the two layers.
async function getJson<T>(
  path: string,
  opts: { timeoutMs?: number; retries?: number } = {}
): Promise<T> {
  const maxRetries = opts.retries ?? RETRY_DELAYS_MS.length;
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetchWithTimeout(
        `${BASE_URL}${path}`,
        { headers: GET_HEADERS },
        opts.timeoutMs
      );
      return await handleResponse<T>(res);
    } catch (err) {
      if (attempt >= maxRetries || !isRetryable(err)) throw err;
      const base = RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)];
      // ±25% jitter so multiple tabs/users don't re-burst the pool in lockstep
      await sleep(base * (0.75 + Math.random() * 0.5));
    }
  }
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const api = {
  // Public ─────────────────────────────────────────────────────────────────────

  getCategories(): Promise<ServiceCategory[]> {
    return getJson<unknown>("/categories").then((body) =>
      extractArray<ServiceCategory>(body)
    );
  },

  getTopBookedServices(limit = 6): Promise<TopService[]> {
    return getJson<unknown>(`/services/top-booked?limit=${limit}`).then((body) =>
      extractArray<TopService>(body)
    );
  },

  getBusinessHours(): Promise<BusinessHours[]> {
    return getJson<unknown>("/business-hours").then((body) =>
      extractArray<BusinessHours>(body)
    );
  },

  getServices(): Promise<Service[]> {
    return getJson<unknown>("/services").then((body) =>
      extractArray<Service>(body)
    );
  },

  getBarbers(): Promise<Barber[]> {
    return getJson<unknown>("/barbers").then((body) =>
      extractArray<Barber>(body)
    );
  },

  // Returns available_slots array: ["08:30", "09:00", ...]
  getAvailability(barberId: number, date: string, duration?: number): Promise<string[]> {
    const params = new URLSearchParams({
      barber_id: String(barberId),
      date,
    });
    if (duration) params.append('duration', String(duration));
    // Interactive — the user is watching a spinner, so fail faster and retry
    // once rather than making them wait out the full budget.
    return getJson<unknown>(`/availability?${params}`, { timeoutMs: 8000, retries: 1 })
      .then((body) => {
        // Response shape: { success: true, data: { date, barber_id, available_slots: [] } }
        if (body && typeof body === "object") {
          const data = (body as Record<string, unknown>).data;
          if (data && typeof data === "object") {
            const slots = (data as Record<string, unknown>).available_slots;
            if (Array.isArray(slots)) return slots as string[];
          }
          // fallback: plain array
          if (Array.isArray(data)) return data as string[];
        }
        return [];
      });
  },

  // Writes get a timeout so a stalled request can't spin forever, but are
  // never retried — POST is not idempotent and a retry could double-book.
  bookAppointment(data: AppointmentPayload): Promise<AppointmentResponse> {
    return fetchWithTimeout(
      `${BASE_URL}/appointments`,
      { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(data) },
      20_000
    ).then((res) => handleResponse<AppointmentResponse>(res));
  },

  submitContact(data: ContactPayload): Promise<{ message: string }> {
    return fetchWithTimeout(
      `${BASE_URL}/contact`,
      { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(data) },
      20_000
    ).then((res) => handleResponse<{ message: string }>(res));
  },

  // Auth ───────────────────────────────────────────────────────────────────────

  login(
    email: string,
    password: string
  ): Promise<{ token: string; user: User }> {
    return fetchWithTimeout(
      `${BASE_URL}/login`,
      {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ email, password }),
      },
      20_000
    ).then((res) => handleResponse<{ token: string; user: User }>(res));
  },

  logout(): Promise<{ message: string }> {
    // No body, so no Content-Type — one less header on the preflight.
    return fetchWithTimeout(`${BASE_URL}/logout`, {
      method: "POST",
      headers: authHeaders(),
    }).then((res) => handleResponse<{ message: string }>(res));
  },

  getUser(): Promise<User> {
    return fetchWithTimeout(`${BASE_URL}/user`, { headers: authHeaders() }).then(
      (res) => handleResponse<User>(res)
    );
  },
};
