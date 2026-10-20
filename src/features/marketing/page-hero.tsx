import Image from "next/image";
import { Container } from "@/components/layout/container";
import { SectionBackground } from "@/components/layout/section-background";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/**
 * Composiciones del encabezado (todas oscuras arriba para que la barra se vea transparente):
 *  - center: texto centrado sobre la fotografía a sangre bajo la sombra neutra.
 *  - split:  texto a la izquierda y la fotografía en un marco a la derecha, sobre la banda oscura.
 *  - strip:  texto centrado y una franja fotográfica ancha que cruza la unión entre la banda oscura y el fondo claro.
 */
export type PageHeroVariant = "center" | "split" | "strip";

interface PageHeroProps {
  eyebrow: string;
  title: React.ReactNode;
  description: React.ReactNode;
  children?: React.ReactNode;
  image: string;
  /** Punto focal de la fotografía. */
  imagePosition?: string;
  variant?: PageHeroVariant;
}

function Eyebrow({ children, centered }: { children: React.ReactNode; centered: boolean }) {
  return (
    <p className="inline-flex items-center gap-3 text-sm font-semibold tracking-[0.16em] text-gold-soft uppercase">
      <span aria-hidden className="h-px w-8 bg-gold" />
      {children}
      {centered && <span aria-hidden className="h-px w-8 bg-gold" />}
    </p>
  );
}

export function PageHero({ eyebrow, title, description, children, image, imagePosition, variant = "center" }: PageHeroProps) {
  if (variant === "split") {
    return (
      <section data-navy-hero className="on-navy bg-shade-band relative isolate overflow-hidden pt-32 pb-16 text-snow sm:pt-40 sm:pb-20">
        <div aria-hidden className="bg-grid-light absolute inset-0 -z-10 opacity-60" />
        <Container className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div className="space-y-6">
            <Reveal y={12}>
              <Eyebrow centered={false}>{eyebrow}</Eyebrow>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="text-4xl font-semibold text-balance text-snow sm:text-5xl lg:text-6xl">{title}</h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="max-w-xl text-lg leading-relaxed text-pretty text-snow/80">{description}</p>
            </Reveal>
            {children && <Reveal delay={0.15}>{children}</Reveal>}
          </div>
          <Reveal delay={0.1} y={24} className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div aria-hidden className="absolute -right-4 -bottom-4 hidden h-full w-full rounded-3xl border border-gold/50 sm:block" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-elevated">
              <Image src={image} alt="" fill priority sizes="(min-width: 1024px) 45vw, 100vw" quality={72} className="object-cover" style={{ objectPosition: imagePosition }} />
              <div aria-hidden className="absolute inset-0 bg-linear-to-tr from-shade/50 to-transparent" />
            </div>
          </Reveal>
        </Container>
      </section>
    );
  }

  if (variant === "strip") {
    return (
      <section
        data-navy-hero
        className="on-navy relative isolate overflow-hidden bg-[linear-gradient(180deg,var(--rs-shade)_0%,var(--rs-shade)_66%,var(--rs-mist)_66%)] pt-36 pb-6 text-snow sm:pt-44"
      >
        <div aria-hidden className="bg-shade-band absolute inset-x-0 top-0 -z-10 h-[66%]" />
        <Container className="space-y-10">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <Reveal y={12}>
              <Eyebrow centered>{eyebrow}</Eyebrow>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="text-4xl font-semibold text-balance text-snow sm:text-5xl lg:text-6xl">{title}</h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-pretty text-snow/80">{description}</p>
            </Reveal>
            {children && <Reveal delay={0.15}>{children}</Reveal>}
          </div>
          <Reveal delay={0.15} y={24} className="relative aspect-[16/9] overflow-hidden rounded-3xl shadow-elevated sm:aspect-[21/8]">
            <Image src={image} alt="" fill priority sizes="(min-width: 1280px) 1216px, 100vw" quality={72} className="object-cover" style={{ objectPosition: imagePosition }} />
            <div aria-hidden className="absolute inset-0 bg-linear-to-t from-shade/40 to-transparent" />
            <div aria-hidden className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
          </Reveal>
        </Container>
      </section>
    );
  }

  return (
    <section data-navy-hero className="on-navy relative isolate overflow-hidden bg-shade pt-36 pb-16 text-snow sm:pt-44 sm:pb-24">
      <SectionBackground src={image} overlay="shade" priority position={imagePosition} />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <Container className={cn("max-w-4xl space-y-6 text-center")}>
        <Reveal y={12}>
          <Eyebrow centered>{eyebrow}</Eyebrow>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="text-4xl font-semibold text-balance text-snow sm:text-5xl lg:text-6xl">{title}</h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-pretty text-snow/80">{description}</p>
        </Reveal>
        {children && <Reveal delay={0.15}>{children}</Reveal>}
      </Container>
    </section>
  );
}

/** Botón secundario legible sobre bandas oscuras (se aplica como className sobre variant="outline"). */
export const outlineOnNavy = "border-snow/35 bg-transparent text-snow shadow-none hover:bg-snow/10 hover:text-snow";
