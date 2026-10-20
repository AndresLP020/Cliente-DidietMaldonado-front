import type { Metadata } from "next";
import { QuoteDetailPage } from "@/features/admin/pages/quote-detail-page";

export const metadata: Metadata = { title: "Cotización" };

/** Sin sesión el panel solo muestra un esqueleto: Next no puede validar esta página como navegación instantánea. */
export const instant = false;

export default function Page() {
  return <QuoteDetailPage />;
}
