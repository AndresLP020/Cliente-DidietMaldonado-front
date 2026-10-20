import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SectionBackground } from "@/components/layout/section-background";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="flex-1">
        <section data-navy-hero className="on-navy relative isolate flex min-h-[70svh] items-center overflow-hidden bg-shade pt-24 text-snow">
          <SectionBackground src="/images/backgrounds/hero-code.webp" overlay="shade" priority />
          <Container className="max-w-2xl space-y-6 text-center">
            <p className="font-mono text-sm text-gold-soft">Error 404</p>
            <h1 className="text-4xl font-semibold text-snow sm:text-5xl">No encontramos esta página</h1>
            <p className="text-lg text-snow/80">
              Es posible que la dirección haya cambiado o ya no exista.
            </p>
            <Button asChild variant="brand" size="xl">
              <Link href="/">
                <ArrowLeft data-icon="inline-start" />
                Volver al inicio
              </Link>
            </Button>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
