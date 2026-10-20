import type { Metadata } from "next";
import { TestimonialsPage } from "@/features/admin/pages/testimonials-page";

export const metadata: Metadata = { title: "Testimonios" };

/** Sin sesión el panel solo muestra un esqueleto: Next no puede validar esta página como navegación instantánea. */
export const instant = false;

export default function Page() {
  return <TestimonialsPage />;
}
