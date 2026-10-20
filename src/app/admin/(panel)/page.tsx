import type { Metadata } from "next";
import { DashboardPage } from "@/features/admin/pages/dashboard-page";

export const metadata: Metadata = { title: "Tablero" };

/** Sin sesión el panel solo muestra un esqueleto: Next no puede validar esta página como navegación instantánea. */
export const instant = false;

export default function Page() {
  return <DashboardPage />;
}
