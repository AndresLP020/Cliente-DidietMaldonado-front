import { cacheLife } from "next/cache";
import { publicEnv } from "@/lib/env";
import type { PublicTestimonials } from "@/types/testimonial";

const apiBase = process.env.API_INTERNAL_URL || publicEnv.NEXT_PUBLIC_API_URL;

export type TestimonialsResult = { status: "ok"; data: PublicTestimonials } | { status: "unavailable" };

/**
 * Comentarios aprobados, cacheados unos minutos (como la configuración pública): el inicio sigue
 * prerenderizado y un comentario aprobado en el panel aparece sin volver a desplegar.
 */
export async function getTestimonials(limit = 9): Promise<TestimonialsResult> {
  "use cache";
  cacheLife("minutes");
  try {
    const response = await fetch(`${apiBase}/testimonials?limit=${limit}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return { status: "unavailable" };
    return { status: "ok", data: (await response.json()) as PublicTestimonials };
  } catch {
    return { status: "unavailable" };
  }
}
