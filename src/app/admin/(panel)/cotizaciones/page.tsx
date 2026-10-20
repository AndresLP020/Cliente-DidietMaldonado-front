import type { Metadata } from "next";
import { QuotesPage } from "@/features/admin/pages/quotes-page";

export const metadata: Metadata = { title: "Cotizaciones" };

/** Sin sesión el panel solo muestra un esqueleto: Next no puede validar esta página como navegación instantánea. */
export const instant = false;

export default function Page() {
  return <QuotesPage />;
}
