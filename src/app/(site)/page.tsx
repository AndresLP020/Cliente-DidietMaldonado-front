import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { Section, SectionHeading } from "@/components/layout/section";
import { SectionBackground } from "@/components/layout/section-background";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { benefits, faqs, intro } from "@/content/home";
import { industries } from "@/content/industries";
import { coreServiceLines } from "@/content/services";
import { BuilderTeaser } from "@/features/marketing/builder-teaser";
import { CtaBanner } from "@/features/marketing/cta-banner";
import { FaqJsonLd, FaqList } from "@/features/marketing/faq-section";
import { BentoGrid } from "@/features/marketing/bento-grid";
import { HeroSection } from "@/features/marketing/hero-section";
import { IndustryCard } from "@/features/marketing/industry-card";
import { outlineOnNavy } from "@/features/marketing/page-hero";
import { ProcessTimeline } from "@/features/marketing/process-timeline";
import { PackageGrid } from "@/features/packages/package-grid";
import { cn } from "@/lib/utils";
import { TestimonialsSection } from "@/features/testimonials/testimonials-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* 1. Presentación */}
      <Section aria-labelledby="intro-title" tone="tint">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div className="space-y-6">
            <SectionHeading id="intro-title" eyebrow={intro.eyebrow} title={intro.title} />
            <Reveal delay={0.1} className="space-y-4 text-lg leading-relaxed text-foreground-secondary">
              {intro.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </Reveal>
          </div>
          <Reveal delay={0.15} y={24} className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div aria-hidden className="absolute -top-4 -right-4 hidden h-full w-full rounded-3xl border border-gold/50 sm:block" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border shadow-elevated">
              <Image
                src="/images/backgrounds/intro-office.webp"
                alt=""
                fill
                sizes="(min-width: 1024px) 45vw, (min-width: 640px) 576px, 100vw"
                quality={75}
                className="object-cover"
              />
              <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy/60 to-transparent" />
            </div>
            <p className="absolute -bottom-5 left-6 inline-flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-navy shadow-elevated">
              <span aria-hidden className="h-6 w-px bg-gold" />
              Web · E-commerce · Punto de venta · Software
            </p>
          </Reveal>
        </div>
      </Section>

      {/* 2. Servicios principales: rejilla bento con tarjeta fotográfica */}
      <Section aria-labelledby="services-title" tone="tint-alt">
        <div className="mb-12 grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <SectionHeading id="services-title" eyebrow="Servicios" title="Todo lo que tu negocio necesita para operar y vender" />
          <Reveal delay={0.1}>
            <p className="text-lg leading-relaxed text-pretty text-foreground-secondary lg:border-l lg:border-gold/50 lg:pl-6">
              Desde tu primera página web hasta un punto de venta completo con integraciones.
            </p>
          </Reveal>
        </div>
        <BentoGrid
          items={coreServiceLines.map((line) => ({ icon: line.icon, title: line.title, description: line.description, href: line.href }))}
          feature={{
            image: "/images/backgrounds/services-desk.webp",
            eyebrow: "Un solo proveedor",
            title: "Presencia digital, ventas y operación conectadas",
            description: "Diseñamos, desarrollamos e instalamos cada pieza para que tu negocio funcione como un solo sistema.",
            footer: (
              <Button asChild variant="outline" size="xl" className={outlineOnNavy}>
                <Link href="/servicios">
                  Ver todos los servicios
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            ),
          }}
        />
      </Section>

      {/* 3. Soluciones por industria: primera tarjeta destacada a dos columnas */}
      <Section aria-labelledby="industries-title" tone="tint">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            id="industries-title"
            eyebrow="Industrias"
            title="Una solución para cada negocio."
            description="No importa si estás comenzando o administras varias sucursales. Diseñamos tecnología adaptada a tus operaciones."
          />
          <Button asChild variant="glass" className="h-10 shrink-0 rounded-xl">
            <Link href="/industrias">
              Ver todas las industrias
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {industries.slice(0, 5).map((industry, index) => (
            <StaggerItem key={industry.slug} className={index === 0 ? "sm:col-span-2" : undefined}>
              <IndustryCard industry={industry} featured={index === 0} />
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* 4. Cómo trabajamos: banda fotográfica a sangre con cortes diagonales */}
      <section aria-labelledby="process-title" className="on-navy clip-slant relative isolate z-10 -my-14 overflow-hidden bg-shade py-32 text-snow sm:py-40">
        <SectionBackground src="/images/backgrounds/process-team.webp" overlay="shade" />
        <Container>
          <div className="mb-16 grid gap-6 lg:grid-cols-2 lg:items-end">
            <SectionHeading id="process-title" eyebrow="Cómo trabajamos" title="Un proceso claro de principio a fin" tone="navy" />
            <Reveal delay={0.1}>
              <p className="text-lg leading-relaxed text-snow/80">
                Cinco etapas, un mismo equipo. Sabes en todo momento qué sigue y qué incluye tu proyecto.
              </p>
            </Reveal>
          </div>
          <ProcessTimeline />
        </Container>
      </section>

      {/* 5. Constructor de soluciones: foto enmarcada a la izquierda */}
      <Section aria-label="Constructor de soluciones personalizadas" tone="tint-alt">
        <BuilderTeaser />
      </Section>

      {/* 6. Paquetes: mitad superior oscura con curva; las tarjetas cruzan la unión */}
      <section aria-labelledby="packages-title" className="bg-tint relative isolate pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div aria-hidden className="on-navy absolute inset-x-0 top-0 -z-10 h-[30rem] overflow-hidden [clip-path:ellipse(140%_100%_at_50%_0%)] sm:h-[28rem]">
          <SectionBackground src="/images/backgrounds/night-offices.webp" overlay="shade" />
        </div>
        <Container>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              id="packages-title"
              eyebrow="Paquetes"
              title="Paquetes listos para comenzar"
              description="Precios iniciales sugeridos en MXN. Personaliza cualquier paquete agregando o retirando componentes."
              tone="navy"
            />
            <Button asChild variant="outline" className={cn("h-10 shrink-0 rounded-xl", outlineOnNavy)}>
              <Link href="/paquetes">
                Ver todos los paquetes
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
          <div className="mt-12">
            <PackageGrid featured limit={3} />
          </div>
        </Container>
      </section>

      {/* 7. Beneficios: banda oscura con bento (tarjeta destacada a la derecha) */}
      <section aria-labelledby="benefits-title" className="on-navy clip-slant-reverse bg-shade-band relative isolate z-10 -my-14 overflow-hidden py-32 text-snow sm:py-40">
        <Container>
          <SectionHeading id="benefits-title" eyebrow="Beneficios" title="Por qué trabajar con ReaperSys" align="center" tone="navy" className="mb-14" />
          <BentoGrid
            surface="dark"
            featureSide="right"
            items={benefits.map((benefit) => ({ icon: benefit.icon, title: benefit.title, description: benefit.description }))}
            feature={{
              image: "/images/backgrounds/benefits-glass.webp",
              eyebrow: "Nuestro compromiso",
              title: "Claridad antes, durante y después del proyecto",
              description: "Alcances definidos, importes desglosados y acompañamiento para que tomes decisiones con información completa.",
            }}
          />
        </Container>
      </section>

      {/* 8. Testimonios de clientes (solo aprobados) */}
      <TestimonialsSection className="pt-36 sm:pt-44" />

      {/* 9. Preguntas frecuentes: panel lateral fijo + acordeón */}
      <Section aria-labelledby="faq-title" tone="tint">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.4fr] lg:gap-16">
          <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <SectionHeading id="faq-title" eyebrow="Preguntas frecuentes" title="Resolvemos tus dudas" />
            <Reveal className="on-navy relative isolate overflow-hidden rounded-3xl p-6 text-snow shadow-elevated">
              <Image src="/images/backgrounds/intro-office.webp" alt="" fill sizes="(min-width: 1024px) 30vw, 100vw" quality={60} className="-z-10 object-cover" />
              <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-shade/95 via-shade/80 to-shade/50" />
              <p className="font-heading text-lg font-semibold text-snow">¿No encuentras tu respuesta?</p>
              <p className="mt-2 text-sm leading-relaxed text-snow/80">Un asesor revisa tu caso y te responde con una propuesta clara.</p>
              <Button asChild size="lg" className="mt-5 bg-snow text-navy hover:bg-gold-soft">
                <Link href="/contacto">
                  Hablar con un asesor
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </Reveal>
          </div>
          <Reveal>
            <FaqList faqs={faqs} />
          </Reveal>
        </div>
        <FaqJsonLd faqs={faqs} />
      </Section>

      {/* 10. CTA comercial (11. Footer en el layout) */}
      <CtaBanner />
    </>
  );
}
