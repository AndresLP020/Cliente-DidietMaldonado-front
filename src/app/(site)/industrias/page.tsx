import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { industries } from "@/content/industries";
import { CtaBanner } from "@/features/marketing/cta-banner";
import { IndustryCard } from "@/features/marketing/industry-card";
import { PageHero } from "@/features/marketing/page-hero";

export const metadata: Metadata = {
  title: "Industrias",
  description:
    "Soluciones tecnológicas para tiendas, restaurantes, boutiques, salones, farmacias, ferreterías, consultorios, empresas de servicios y negocios con sucursales.",
  alternates: { canonical: "/industrias" },
};

const FEATURED_INDEXES = new Set([0, 3, 7]);

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Industrias"
        title="Una solución para cada negocio."
        description="No importa si estás comenzando o administras varias sucursales. Diseñamos tecnología adaptada a tus operaciones."
        image="/images/backgrounds/storefront-night.webp"
        imagePosition="60% center"
        variant="split"
      />
      <Section aria-label="Industrias" tone="tint" className="pt-14 sm:pt-20">
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry, index) => {
            // Tres tarjetas destacadas a dos columnas (12 celdas exactas en 3 columnas) rompen la rejilla uniforme.
            const featured = FEATURED_INDEXES.has(index);
            return (
              <StaggerItem key={industry.slug} id={industry.slug} className={featured ? "sm:col-span-2" : undefined}>
                <IndustryCard industry={industry} featured={featured} />
              </StaggerItem>
            );
          })}
        </Stagger>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Los ejemplos describen soluciones posibles para cada giro. ¿Tu negocio no aparece? El cotizador incluye la opción
          &quot;Otro&quot;.
        </p>
      </Section>
      <CtaBanner />
    </>
  );
}
