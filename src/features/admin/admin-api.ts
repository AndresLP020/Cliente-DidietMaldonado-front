import { apiFetch } from "@/lib/api-client";

/**
 * Cliente de la API administrativa. La sesión viaja en una cookie httpOnly (el navegador la envía);
 * el token anti-CSRF se guarda solo en memoria y se agrega a toda petición que modifica datos.
 */
let csrfToken: string | null = null;

export function setCsrfToken(token: string | null) {
  csrfToken = token;
}

type Method = "POST" | "PATCH" | "PUT" | "DELETE";

export const adminApi = {
  get: <T>(path: string, params?: Record<string, string | number | undefined>) => {
    const query = params
      ? new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)]))
      : null;
    return apiFetch<T>(`${path}${query && query.size ? `?${query}` : ""}`);
  },
  send: <T>(method: Method, path: string, json?: unknown) =>
    apiFetch<T>(path, { method, json, headers: csrfToken ? { "X-CSRF-Token": csrfToken } : undefined }),
};
