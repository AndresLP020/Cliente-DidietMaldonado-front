import type { Metadata } from "next";
import { ContractDetailPage } from "@/features/admin/pages/contract-detail-page";

export const metadata: Metadata = { title: "Renta o compra" };

/** Sin sesión el panel solo muestra un esqueleto: Next no puede validar esta página como navegación instantánea. */
export const instant = false;

export default function Page() {
  return <ContractDetailPage />;
}
