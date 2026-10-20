"use client";

import { RotateCcw } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SectionBackground } from "@/components/layout/section-background";
import { Button } from "@/components/ui/button";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section data-navy-hero className="on-navy relative isolate flex min-h-[70svh] items-center overflow-hidden bg-shade pt-24 text-snow">
      <SectionBackground src="/images/backgrounds/hero-code.webp" overlay="shade" />
      <Container className="max-w-2xl space-y-6 text-center">
        <h1 className="text-3xl font-semibold text-snow sm:text-4xl">Algo salió mal</h1>
        <p className="text-lg text-snow/80">Ocurrió un error al cargar esta sección. Puedes intentarlo de nuevo.</p>
        <Button variant="brand" size="xl" onClick={reset}>
          <RotateCcw data-icon="inline-start" />
          Reintentar
        </Button>
      </Container>
    </section>
  );
}
