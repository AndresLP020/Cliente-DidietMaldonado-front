import type { Metadata } from "next";
import { UsersPage } from "@/features/admin/pages/users-page";

export const metadata: Metadata = { title: "Usuarios" };

/** Sin sesión el panel solo muestra un esqueleto: Next no puede validar esta página como navegación instantánea. */
export const instant = false;

export default function Page() {
  return <UsersPage />;
}
