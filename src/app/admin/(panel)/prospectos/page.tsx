import type { Metadata } from "next";
import { LeadsPage } from "@/features/admin/pages/leads-page";

export const metadata: Metadata = { title: "Prospectos" };

/** Sin sesión el panel solo muestra un esqueleto: Next no puede validar esta página como navegación instantánea. */
export const instant = false;

export default function Page() {
  return <LeadsPage />;
}
