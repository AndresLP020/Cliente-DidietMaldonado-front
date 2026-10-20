import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { services } from "@/content/services";
import { CtaBanner } from "@/features/marketing/cta-banner";
import { BentoGrid } from "@/features/marketing/bento-grid";
import { PageHero } from "@/features/marketing/page-hero";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Landing pages, sitios corporativos, tiendas virtuales, punto de venta, equipos, software personalizado, integraciones, automatización y soporte.",
  alternates: { canonical: "/servicios" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Servicios"
        title="Soluciones para cada etapa de tu negocio"
        description="Presencia digital, ventas en línea, punto de venta, software a la medida y soporte, con un mismo proveedor."
        image="/images/backgrounds/services-desk.webp"
        variant="split"
      />
      <Section aria-label="Catálogo de servicios" tone="tint-alt">
        <BentoGrid
          items={services.map((service) => ({
            icon: service.icon,
            title: service.name,
            description: service.summary,
            href: service.href,
            tags: service.highlights,
          }))}
          feature={{
            image: "/images/backgrounds/process-team.webp",
            eyebrow: "Cómo te acompañamos",
            title: "Del diagnóstico al soporte, con el mismo equipo",
            description: "Elige un servicio o combínalos: cada propuesta parte de cómo funciona tu negocio hoy.",
          }}
        />
      </Section>
      <CtaBanner />
    </>
  );
}
