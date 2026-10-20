import type { Metadata } from "next";
import { PricesPage } from "@/features/admin/pages/prices-page";

export const metadata: Metadata = { title: "Catálogo y precios" };

/** Sin sesión el panel solo muestra un esqueleto: Next no puede validar esta página como navegación instantánea. */
export const instant = false;

export default function Page() {
  return <PricesPage />;
}
