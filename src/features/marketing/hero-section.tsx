import { ArrowRight, Boxes, Check } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SectionBackground } from "@/components/layout/section-background";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { hero } from "@/content/home";
import { CodeShowcase } from "@/features/hero/code-showcase";
import { outlineOnNavy } from "./page-hero";

const assurances = ["Precios transparentes en MXN", "Hardware y software en un solo lugar", "Soporte y mantenimiento opcionales"];

export function HeroSection() {
  return (
    <section
      data-navy-hero
      aria-labelledby="hero-title"
      className="on-navy relative isolate overflow-hidden bg-shade pt-32 pb-20 text-snow sm:pt-40 lg:flex lg:min-h-[min(100svh,920px)] lg:items-center lg:pb-24"
    >
      {/* Fondo: fotografía de un entorno de desarrollo con sombra neutra del lado del texto */}
      <SectionBackground src="/images/backgrounds/hero-code.webp" overlay="shade-split" priority position="70% center" />
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      </div>

      <Container className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
        <div className="min-w-0 space-y-8">
          <Reveal y={16}>
            <p className="inline-flex items-center gap-3 text-xs font-semibold tracking-[0.18em] text-gold-soft uppercase sm:text-sm">
              <span aria-hidden className="h-px w-10 bg-gold" />
              Soluciones web, e-commerce y punto de venta
            </p>
          </Reveal>
          <Reveal delay={0.05} fade={false}>
            <h1 id="hero-title" className="text-4xl leading-[1.08] font-semibold text-balance text-snow sm:text-5xl xl:text-[3.75rem]">
              {hero.title}
            </h1>
          </Reveal>
          <Reveal delay={0.12} fade={false}>
            <p className="max-w-xl text-lg leading-relaxed text-pretty text-snow/80 sm:text-xl">{hero.subtitle}</p>
          </Reveal>
          <Reveal delay={0.18} className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="brand" size="xl">
              <Link href="/cotizador">
                Cotizar mi solución
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl" className={outlineOnNavy}>
              <Link href="/paquetes">
                <Boxes data-icon="inline-start" />
                Explorar paquetes
              </Link>
            </Button>
          </Reveal>
          <Reveal delay={0.24}>
            <ul className="flex flex-col gap-2 border-t border-snow/10 pt-6 text-sm text-snow/80 sm:flex-row sm:flex-wrap sm:gap-x-6">
              {assurances.map((item) => (
                <li key={item} className="inline-flex items-center gap-2">
                  <Check className="size-4 text-gold-soft" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.15} y={24} className="min-w-0">
          <CodeShowcase />
        </Reveal>
      </Container>
    </section>
  );
}
