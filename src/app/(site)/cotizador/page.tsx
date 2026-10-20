import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { SectionBackground } from "@/components/layout/section-background";
import { Skeleton } from "@/components/ui/skeleton";
import { QuoteBuilder } from "@/features/quote-builder/quote-builder";

export const metadata: Metadata = {
  title: "Cotizador",
  description: "Configura tu solución tecnológica paso a paso y recibe una cotización formal con folio.",
  alternates: { canonical: "/cotizador" },
};

export default function QuoteBuilderPage() {
  return (
    <>
      <section data-navy-hero className="on-navy relative isolate overflow-hidden bg-shade pt-32 pb-14 text-snow sm:pt-36">
        <SectionBackground src="/images/backgrounds/hero-code.webp" overlay="shade-split" priority position="70% center" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        <Container>
          <header className="max-w-3xl space-y-3">
            <p className="inline-flex items-center gap-3 text-sm font-semibold tracking-[0.16em] text-gold-soft uppercase">
              <span aria-hidden className="h-px w-8 bg-gold" />
              Cotizador
            </p>
            <h1 className="text-3xl font-semibold text-balance text-snow sm:text-4xl">Configura tu solución</h1>
            <p className="text-lg text-snow/80">Elige tu industria y un paquete, personaliza los componentes y recibe tu cotización formal.</p>
          </header>
        </Container>
      </section>
      <section aria-label="Configurador" className="bg-tint min-h-[60svh] pt-10 pb-24 sm:pt-14">
        <Container>
          {/* useSearchParams requiere un límite de Suspense con Cache Components. */}
          <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
            <QuoteBuilder />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
