import { publicEnv } from "./env";

/** Formato de error uniforme que devuelve el backend (AllExceptionsFilter). */
export interface ApiErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
}

export class ApiError extends Error {
  override name = "ApiError";

  constructor(
    readonly status: number,
    readonly body: ApiErrorBody | null,
  ) {
    const message = body ? [body.message].flat().join(" ") : `Error HTTP ${status}`;
    super(message);
  }
}

type ApiRequestInit = Omit<RequestInit, "body"> & { json?: unknown };

/**
 * Cliente HTTP hacia la API de ReaperSys.
 * - Envía cookies (sesión de administrador) con `credentials: "include"`.
 * - El navegador nunca se conecta a MongoDB: todo pasa por la API.
 */
export async function apiFetch<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  const response = await fetch(`${publicEnv.NEXT_PUBLIC_API_URL}${path}`, {
    credentials: "include",
    ...rest,
    headers: {
      Accept: "application/json",
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiError(response.status, body);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
