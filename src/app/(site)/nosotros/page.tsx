import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/layout/section";
import { SectionBackground } from "@/components/layout/section-background";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { intro } from "@/content/home";
import { aboutValues } from "@/content/service-pages";
import { services } from "@/content/services";
import { CtaBanner } from "@/features/marketing/cta-banner";
import { FeatureCard } from "@/features/marketing/feature-card";
import { PageHero } from "@/features/marketing/page-hero";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "ReaperSys desarrolla soluciones tecnológicas y digitales para negocios de cualquier tamaño y sector.",
  alternates: { canonical: "/nosotros" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Nosotros"
        title="Tecnología que se adapta a tu negocio"
        description="Tecnología personalizada para simplificar operaciones, modernizar empresas y facilitar su crecimiento."
        image="/images/backgrounds/nosotros-lobby.webp"
        variant="strip"
      />

      <Section aria-labelledby="who-title" tone="tint">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <SectionHeading id="who-title" eyebrow="Quiénes somos" title="Un solo equipo para lo digital y lo operativo" />
          <Reveal delay={0.1} className="space-y-5 text-lg leading-relaxed text-foreground-secondary">
            {intro.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p>
              Trabajamos con negocios de diferentes industrias: comercios, restaurantes, consultorios, empresas de servicios y
              operaciones con varias sucursales. Cada propuesta parte de cómo funciona tu negocio hoy y hacia dónde quiere crecer.
            </p>
          </Reveal>
        </div>
      </Section>

      <Section aria-labelledby="values-title" tone="dark">
        <SectionBackground src="/images/backgrounds/process-team.webp" overlay="shade" />
        <SectionHeading id="values-title" eyebrow="Cómo pensamos" title="Principios de trabajo" align="center" tone="navy" />
        <Stagger className="mt-12 grid gap-5 md:grid-cols-3">
          {aboutValues.map((value) => (
            <StaggerItem key={value.title}>
              <FeatureCard icon={value.icon} title={value.title} description={value.description} tone="dark" />
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      <Section aria-labelledby="what-title" tone="tint-alt">
        <SectionHeading id="what-title" eyebrow="Qué hacemos" title="Servicios" />
        <Reveal className="mt-10">
          <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <li key={service.slug} className="flex items-center gap-3 border-b border-soft-gray py-3 text-foreground-secondary">
                <service.icon className="size-4 shrink-0 text-electric" aria-hidden />
                {service.name}
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>

      <CtaBanner />
    </>
  );
}
