import type { Metadata } from "next";
import { BillingPage } from "@/features/admin/pages/billing-page";

export const metadata: Metadata = { title: "Cobranza" };

/** Sin sesión el panel solo muestra un esqueleto: Next no puede validar esta página como navegación instantánea. */
export const instant = false;

export default function Page() {
  return <BillingPage />;
}
