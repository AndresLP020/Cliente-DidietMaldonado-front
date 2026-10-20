import { apiFetch } from "@/lib/api-client";
import type { PublicSettings } from "@/services/public-settings";
import type { PackageListResponse } from "@/types/catalog";
import type {
  CreateQuoteRequest,
  CreateQuoteResult,
  PublicComponent,
  PublicIndustry,
  PublicPackageDetail,
  QuoteCalculation,
  QuoteSelection,
} from "@/types/quote";

/** Acceso a la API desde el navegador (cotizador). */
export const quoteApi = {
  industries: () => apiFetch<{ items: PublicIndustry[] }>("/industries").then((r) => r.items),
  packages: () => apiFetch<PackageListResponse>("/packages").then((r) => r.items),
  packageDetail: (slug: string) => apiFetch<PublicPackageDetail>(`/packages/${encodeURIComponent(slug)}`),
  components: () => apiFetch<{ items: PublicComponent[] }>("/components/public").then((r) => r.items),
  preview: (selection: QuoteSelection, signal?: AbortSignal) =>
    apiFetch<QuoteCalculation>("/quotes/preview", { method: "POST", json: { selection }, signal }),
  publicSettings: () => apiFetch<PublicSettings>("/settings/public"),
  create: (body: CreateQuoteRequest) => apiFetch<CreateQuoteResult>("/quotes", { method: "POST", json: body }),
};
