import type { Metadata } from "next";
import { ClientDetailPage } from "@/features/admin/pages/client-detail-page";

export const metadata: Metadata = { title: "Cliente" };

/** Sin sesión el panel solo muestra un esqueleto: Next no puede validar esta página como navegación instantánea. */
export const instant = false;

export default function Page() {
  return <ClientDetailPage />;
}
