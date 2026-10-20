import type { Metadata } from "next";
import { SettingsPage } from "@/features/admin/pages/settings-page";

export const metadata: Metadata = { title: "Configuración" };

/** Sin sesión el panel solo muestra un esqueleto: Next no puede validar esta página como navegación instantánea. */
export const instant = false;

export default function Page() {
  return <SettingsPage />;
}
