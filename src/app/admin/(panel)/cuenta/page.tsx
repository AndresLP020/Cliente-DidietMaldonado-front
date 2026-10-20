import type { Metadata } from "next";
import { AccountPage } from "@/features/admin/pages/account-page";

export const metadata: Metadata = { title: "Mi cuenta" };

/** Sin sesión el panel solo muestra un esqueleto: Next no puede validar esta página como navegación instantánea. */
export const instant = false;

export default function Page() {
  return <AccountPage />;
}
