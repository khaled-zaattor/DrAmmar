const BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : "/api";

const JSON_HEADERS: HeadersInit = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

function authHeaders(): HeadersInit {
  // Guarded so this module can be imported during prerendering, where there is
  // no localStorage. These calls only ever run in a browser anyway.
  const token =
    typeof localStorage === "undefined"
      ? null
      : localStorage.getItem("auth_token");
  return token
    ? { ...JSON_HEADERS, Authorization: `Bearer ${token}` }
    : JSON_HEADERS;
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
    throw new Error(message);
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
  is_addon?: boolean;
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
  is_addon?: boolean;
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

// A cold API response takes a few seconds on wifi and considerably longer on a
// weak mobile signal, so the budget follows the connection the phone reports.
const TIMEOUT_MS = 15000;
const SLOW_CONNECTION_TIMEOUT_MS = 25000;

function requestTimeout(): number {
  if (typeof navigator === "undefined") return TIMEOUT_MS;
  const connection = (
    navigator as Navigator & { connection?: { effectiveType?: string } }
  ).connection;
  const type = connection?.effectiveType;
  return type === "2g" || type === "slow-2g"
    ? SLOW_CONNECTION_TIMEOUT_MS
    : TIMEOUT_MS;
}

function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = requestTimeout()
): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  return fetch(input, { ...init, signal: ctrl.signal })
    .catch((error) => {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error("the connection is too slow to reach the server");
      }
      throw error;
    })
    .finally(() => clearTimeout(timer));
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const api = {
  // Public ─────────────────────────────────────────────────────────────────────

  getCategories(): Promise<ServiceCategory[]> {
    return fetchWithTimeout(`${BASE_URL}/categories`, { headers: JSON_HEADERS })
      .then((res) => handleResponse<unknown>(res))
      .then((body) => extractArray<ServiceCategory>(body));
  },

  getTopBookedServices(limit = 6): Promise<TopService[]> {
    return fetchWithTimeout(`${BASE_URL}/services/top-booked?limit=${limit}`, { headers: JSON_HEADERS })
      .then((res) => handleResponse<unknown>(res))
      .then((body) => extractArray<TopService>(body));
  },

  getBusinessHours(): Promise<BusinessHours[]> {
    return fetchWithTimeout(`${BASE_URL}/business-hours`, { headers: JSON_HEADERS })
      .then((res) => handleResponse<unknown>(res))
      .then((body) => extractArray<BusinessHours>(body));
  },

  getServices(): Promise<Service[]> {
    return fetchWithTimeout(`${BASE_URL}/services`, { headers: JSON_HEADERS })
      .then((res) => handleResponse<unknown>(res))
      .then((body) => extractArray<Service>(body));
  },

  getBarbers(): Promise<Barber[]> {
    return fetchWithTimeout(`${BASE_URL}/barbers`, { headers: JSON_HEADERS })
      .then((res) => handleResponse<unknown>(res))
      .then((body) => extractArray<Barber>(body));
  },

  // Returns available_slots array: ["08:30", "09:00", ...]
  getAvailability(barberId: number, date: string, duration?: number): Promise<string[]> {
    const params = new URLSearchParams({
      barber_id: String(barberId),
      date,
    });
    if (duration !== undefined) params.append('duration', String(duration));
    return fetchWithTimeout(`${BASE_URL}/availability?${params}`, {
      headers: JSON_HEADERS,
    })
      .then((res) => handleResponse<unknown>(res))
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

  bookAppointment(data: AppointmentPayload): Promise<AppointmentResponse> {
    return fetch(`${BASE_URL}/appointments`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    }).then((res) => handleResponse<AppointmentResponse>(res));
  },

  submitContact(data: ContactPayload): Promise<{ message: string }> {
    return fetch(`${BASE_URL}/contact`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    }).then((res) => handleResponse<{ message: string }>(res));
  },

  // Auth ───────────────────────────────────────────────────────────────────────

  login(
    email: string,
    password: string
  ): Promise<{ token: string; user: User }> {
    return fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ email, password }),
    }).then((res) => handleResponse<{ token: string; user: User }>(res));
  },

  logout(): Promise<{ message: string }> {
    return fetch(`${BASE_URL}/logout`, {
      method: "POST",
      headers: authHeaders(),
    }).then((res) => handleResponse<{ message: string }>(res));
  },

  getUser(): Promise<User> {
    return fetch(`${BASE_URL}/user`, { headers: authHeaders() }).then(
      (res) => handleResponse<User>(res)
    );
  },
};
