import { publicEnv } from "@/lib/env";
import type { PackageCategory, PackageListResponse, PublicPackage } from "@/types/catalog";

/**
 * Acceso al catálogo desde Server Components.
 * API_INTERNAL_URL permite usar una dirección interna (p. ej. red de Docker) en el servidor.
 */
const apiBase = process.env.API_INTERNAL_URL || publicEnv.NEXT_PUBLIC_API_URL;

export type CatalogResult =
  | { status: "ok"; items: PublicPackage[] }
  | { status: "unavailable"; reason: "not_implemented" | "error" };

export async function getPackages(filter: { category?: PackageCategory; featured?: boolean } = {}): Promise<CatalogResult> {
  const params = new URLSearchParams();
  if (filter.category) params.set("category", filter.category);
  if (filter.featured) params.set("featured", "true");
  const query = params.size ? `?${params}` : "";

  try {
    const response = await fetch(`${apiBase}/packages${query}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
    if (response.status === 404) return { status: "unavailable", reason: "not_implemented" };
    if (!response.ok) return { status: "unavailable", reason: "error" };
    const body = (await response.json()) as PackageListResponse;
    return { status: "ok", items: [...body.items].sort((a, b) => a.sortOrder - b.sortOrder) };
  } catch {
    return { status: "unavailable", reason: "error" };
  }
}
