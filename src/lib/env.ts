import { z } from "zod";

/**
 * Variables públicas del frontend. Solo las NEXT_PUBLIC_* llegan al navegador,
 * por eso deben leerse con acceso estático (Next.js las reemplaza en build).
 * Nunca colocar secretos aquí. Los datos de contacto y redes NO van aquí:
 * se administran en /admin/configuracion (ver services/public-settings.ts).
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url().default("http://localhost:4000/api/v1"),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
});

export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || undefined,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
});
