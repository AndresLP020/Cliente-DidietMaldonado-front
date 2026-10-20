import { publicEnv } from "@/lib/env";
import type { PublicQuoteView } from "@/types/quote";

const apiBase = process.env.API_INTERNAL_URL || publicEnv.NEXT_PUBLIC_API_URL;

export type QuoteAccessResult =
  | { status: "ok"; quote: PublicQuoteView }
  | { status: "invalid" | "not_found" | "expired" | "error" };

/** Consulta una cotización por su token de acceso (Server Components). Nunca se cachea. */
export async function getQuoteByToken(token: string): Promise<QuoteAccessResult> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return { status: "invalid" };
  try {
    const response = await fetch(`${apiBase}/quotes/access/${token}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (response.status === 404) return { status: "not_found" };
    if (response.status === 410) return { status: "expired" };
    if (response.status === 400) return { status: "invalid" };
    if (!response.ok) return { status: "error" };
    return { status: "ok", quote: (await response.json()) as PublicQuoteView };
  } catch {
    return { status: "error" };
  }
}
