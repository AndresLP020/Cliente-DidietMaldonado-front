import { publicEnv } from "@/lib/env";

/** PDF de la versión vigente, servido por la API mediante el token de acceso. */
export function quotePdfUrl(token: string): string {
  return `${publicEnv.NEXT_PUBLIC_API_URL}/quotes/access/${encodeURIComponent(token)}/pdf`;
}

/** PDF de una versión desde el panel (la cookie de sesión viaja con la navegación). */
export function adminQuotePdfUrl(quoteId: string, version?: number): string {
  return `${publicEnv.NEXT_PUBLIC_API_URL}/admin/quotes/${encodeURIComponent(quoteId)}/pdf${version ? `?version=${version}` : ""}`;
}
