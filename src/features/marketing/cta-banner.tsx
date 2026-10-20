import { ArrowRight, MessageSquareText } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SectionBackground } from "@/components/layout/section-background";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { outlineOnNavy } from "./page-hero";

interface CtaBannerProps {
  title?: string;
  description?: string;
}

export function CtaBanner({
  title = "¿Listo para diseñar la tecnología de tu negocio?",
  description = "Configura tu solución en el cotizador o cuéntanos qué necesitas. Te respondemos con una propuesta clara.",
}: CtaBannerProps) {
  return (
    <section className="bg-tint py-20 sm:py-28">
      <Container>
        <Reveal className="relative isolate overflow-hidden rounded-3xl bg-shade px-6 py-14 text-center text-snow shadow-elevated sm:px-12 sm:py-20">
          <SectionBackground src="/images/backgrounds/cta-city.webp" overlay="shade" />
          <div aria-hidden className="absolute inset-x-12 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold text-balance text-snow sm:text-4xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-pretty text-snow/80">{description}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="xl" className="bg-snow text-navy shadow-card hover:bg-gold-soft">
              <Link href="/cotizador">
                Cotizar ahora
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl" className={outlineOnNavy}>
              <Link href="/contacto">
                <MessageSquareText data-icon="inline-start" />
                Hablar con un asesor
              </Link>
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
