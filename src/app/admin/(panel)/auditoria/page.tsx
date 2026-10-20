import type { Metadata } from "next";
import { AuditPage } from "@/features/admin/pages/audit-page";

export const metadata: Metadata = { title: "Auditoría" };

/** Sin sesión el panel solo muestra un esqueleto: Next no puede validar esta página como navegación instantánea. */
export const instant = false;

export default function Page() {
  return <AuditPage />;
}
