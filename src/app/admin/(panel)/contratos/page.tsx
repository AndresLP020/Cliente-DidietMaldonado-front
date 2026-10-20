import type { Metadata } from "next";
import { ContractsPage } from "@/features/admin/pages/contracts-page";

export const metadata: Metadata = { title: "Rentas y compras" };

/** Sin sesión el panel solo muestra un esqueleto: Next no puede validar esta página como navegación instantánea. */
export const instant = false;

export default function Page() {
  return <ContractsPage />;
}
