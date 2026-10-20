import { cacheLife } from "next/cache";
import { publicEnv } from "@/lib/env";

/** Datos públicos del negocio administrados desde /admin/configuracion. */
export interface PublicSettings {
  tradeName: string;
  contact: {
    email: string | null;
    whatsapp: string | null;
    facebook: string | null;
    instagram: string | null;
    tiktok: string | null;
  };
  quote: { validityDays: number | null; depositRateBp: number };
  subscription: { minimumTermMonths: number; monthToMonthSurchargeBp: number; semiannualDiscountBp: number; annualDiscountBp: number };
  privacyNotice:
    | { published: false }
    | { published: true; updatedAt: string; legalName: string; legalAddress: string; contactEmail: string };
}

const EMPTY: PublicSettings = {
  tradeName: "ReaperSys",
  contact: { email: null, whatsapp: null, facebook: null, instagram: null, tiktok: null },
  quote: { validityDays: null, depositRateBp: 5000 },
  subscription: { minimumTermMonths: 12, monthToMonthSurchargeBp: 1500, semiannualDiscountBp: 500, annualDiscountBp: 1000 },
  privacyNotice: { published: false },
};

const apiBase = process.env.API_INTERNAL_URL || publicEnv.NEXT_PUBLIC_API_URL;

/**
 * Configuración pública cacheada unos minutos: el sitio sigue prerenderizado y los cambios
 * hechos en el panel aparecen sin recompilar ni desplegar.
 */
export async function getPublicSettings(): Promise<PublicSettings> {
  "use cache";
  try {
    const response = await fetch(`${apiBase}/settings/public`, { signal: AbortSignal.timeout(5_000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    cacheLife("minutes");
    return (await response.json()) as PublicSettings;
  } catch {
    // API no disponible (p. ej. al compilar): sin datos de contacto; se revalida en un minuto.
    // Un perfil más corto ("seconds") vuelve dinámico el layout y rompe el prerenderizado.
    cacheLife("minutes");
    return EMPTY;
  }
}

/** Enlaces de contacto listos para mostrar; solo los que estén configurados. */
export function contactLinks(settings: PublicSettings) {
  const { contact } = settings;
  return {
    email: contact.email,
    whatsappUrl: contact.whatsapp ? `https://wa.me/${contact.whatsapp}` : null,
    social: [
      { label: "Facebook", url: contact.facebook },
      { label: "Instagram", url: contact.instagram },
      { label: "TikTok", url: contact.tiktok },
    ].filter((item): item is { label: string; url: string } => Boolean(item.url)),
  };
}
