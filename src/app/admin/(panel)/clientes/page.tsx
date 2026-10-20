import type { Metadata } from "next";
import { ClientsPage } from "@/features/admin/pages/clients-page";

export const metadata: Metadata = { title: "Clientes" };

/** Sin sesión el panel solo muestra un esqueleto: Next no puede validar esta página como navegación instantánea. */
export const instant = false;

export default function Page() {
  return <ClientsPage />;
}
