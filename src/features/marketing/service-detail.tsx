import { ArrowRight, Info, Plus } from "lucide-react";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import type { ServicePageContent } from "@/content/service-pages";
import { PackageGrid } from "@/features/packages/package-grid";
import { CtaBanner } from "./cta-banner";
import { BentoGrid } from "./bento-grid";
import { outlineOnNavy, PageHero, type PageHeroVariant } from "./page-hero";

/** Plantilla común para /desarrollo-web, /ecommerce y /punto-de-venta. */
export function ServiceDetail({
  content,
  image,
  imagePosition,
  variant,
  featureImage,
}: {
  content: ServicePageContent;
  image: string;
  /** Fotografía de la tarjeta destacada de capacidades (distinta a la del encabezado). */
  featureImage: string;
  imagePosition?: string;
  variant?: PageHeroVariant;
}) {
  return (
    <>
      <PageHero eyebrow={content.eyebrow} title={content.title} description={content.description} image={image} imagePosition={imagePosition} variant={variant}>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild variant="brand" size="xl">
            <Link href="/cotizador">
              Cotizar ahora
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="xl" className={outlineOnNavy}>
            <Link href="#paquetes">Ver paquetes</Link>
          </Button>
        </div>
      </PageHero>

      <Section aria-labelledby="capabilities-title" tone="tint-alt">
        <SectionHeading id="capabilities-title" eyebrow="Qué incluye" title="Lo que podemos implementar para ti" className="mb-12" />
        <BentoGrid
          featureSide="right"
          items={content.capabilities}
          feature={{ image: featureImage, eyebrow: content.eyebrow, title: content.title, description: content.description }}
        />
      </Section>

      <Section id="paquetes" aria-labelledby="packages-title" tone="dark" className="clip-slant z-10 -my-14 py-32 sm:py-40">
        <SectionHeading
          id="packages-title"
          eyebrow="Paquetes"
          title="Elige un punto de partida"
          description="Importes iniciales sugeridos en MXN. Cualquier paquete se puede personalizar en el cotizador."
          tone="navy"
        />
        <div className="mt-12 space-y-12">
          {content.packageCategories.map((category) => (
            <PackageGrid key={category} category={category} />
          ))}
        </div>
      </Section>

      <Section aria-labelledby="addons-title" tone="tint" className="pt-32 sm:pt-40">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <SectionHeading
              id="addons-title"
              eyebrow="Complementos"
              title="Amplía tu solución"
              description="Agrega solo lo que necesitas. El cotizador muestra el precio vigente de cada complemento."
            />
            <Reveal>
              <ul className="flex flex-wrap gap-2">
                {content.addOns.map((addOn) => (
                  <li
                    key={addOn}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card shadow-card px-3.5 py-1.5 text-sm text-foreground-secondary"
                  >
                    <Plus className="size-3.5 text-electric" aria-hidden />
                    {addOn}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="self-end rounded-2xl border border-border bg-card shadow-card p-6">
            <h3 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold">
              <Info className="size-5 text-electric" aria-hidden />
              Antes de cotizar
            </h3>
            <ul className="space-y-3 text-sm leading-relaxed text-foreground-secondary">
              {content.considerations.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-electric" aria-hidden />
                  {item}
                </li>
              ))}
              <li className="flex gap-3">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-electric" aria-hidden />
                Los conceptos con precio &quot;desde&quot; son mínimos comerciales sujetos a evaluación del alcance.
              </li>
            </ul>
          </Reveal>
        </div>
      </Section>

      <CtaBanner />
    </>
  );
}
