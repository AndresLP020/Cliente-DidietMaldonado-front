import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";
import { getPublicSettings } from "@/services/public-settings";

const publicRoutes: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/servicios", priority: 0.9 },
  { path: "/paquetes", priority: 0.9 },
  { path: "/cotizador", priority: 0.9 },
  { path: "/desarrollo-web", priority: 0.8 },
  { path: "/ecommerce", priority: 0.8 },
  { path: "/punto-de-venta", priority: 0.8 },
  { path: "/industrias", priority: 0.7 },
  { path: "/nosotros", priority: 0.6 },
  { path: "/contacto", priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getPublicSettings();
  const routes = settings.privacyNotice.published ? [...publicRoutes, { path: "/aviso-de-privacidad", priority: 0.3 }] : publicRoutes;
  return routes.map(({ path, priority }) => ({
    url: new URL(path, publicEnv.NEXT_PUBLIC_SITE_URL).toString(),
    changeFrequency: "weekly",
    priority,
  }));
}
