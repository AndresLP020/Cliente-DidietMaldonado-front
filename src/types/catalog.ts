/**
 * Contrato PÚBLICO del catálogo (GET /api/v1/packages).
 * Solo incluye datos comerciales autorizados: nunca costos ni márgenes.
 * Los importes son enteros en centavos calculados por el backend.
 */

export type PackageCategory = "web" | "ecommerce" | "pos" | "combo" | "custom";

export interface PublicPricing {
  /** fixed = definitivo; starting_at = "desde"; pending = sin precio aprobado; on_request = sujeto a valoración. */
  mode: "fixed" | "starting_at" | "pending" | "on_request";
  amountCents: number | null;
  currency: "MXN";
  /** true si falta un precio aprobado (no se debe mostrar un importe). */
  pendingPricing: boolean;
}

export interface PublicPackageVariant {
  slug: string;
  name: string;
  description?: string;
  pricing: PublicPricing;
}

export interface PublicPackage {
  slug: string;
  name: string;
  category: PackageCategory;
  summary: string;
  pricing: PublicPricing;
  features: string[];
  variants: PublicPackageVariant[];
  /** Para paquetes combinados: paquetes que lo componen. */
  includesPackages: { slug: string; name: string }[];
  notes: string[];
  featured: boolean;
  sortOrder: number;
  /** Renta mensual; null si el paquete no se ofrece en suscripción. */
  subscription: PublicSubscriptionOffer | null;
}

export interface PublicSubscriptionOffer {
  /** Mensualidad antes de impuestos. */
  pricing: PublicPricing;
  /** POS: el equipo se paga de contado; solo se renta el software. */
  hardwareUpfront: boolean;
  includesHosting: boolean;
  storageGb: number;
  includesDomain: boolean;
  /** La renta cubre solo el software; no incluye equipo. */
  softwareOnly?: boolean;
  /** Soporte al usuario ya incluido en la mensualidad. */
  supportIncludedCents?: number | null;
  /** Dominio y hosting, una vez al año y aparte de la mensualidad. */
  infrastructureAnnualCents?: number | null;
}

export interface PackageListResponse {
  items: PublicPackage[];
}
