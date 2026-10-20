import type { Metadata } from "next";
import { PrivacyPreviewPage } from "@/features/admin/pages/privacy-preview-page";

export const metadata: Metadata = { title: "Vista previa del aviso de privacidad" };

/** Sin sesión el panel solo muestra un esqueleto: Next no puede validar esta página como navegación instantánea. */
export const instant = false;

export default function Page() {
  return <PrivacyPreviewPage />;
}
