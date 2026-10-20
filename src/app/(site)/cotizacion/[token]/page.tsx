import { FileDown, FileQuestion, TimerOff } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LogoMark } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QuoteBreakdown } from "@/features/quote-builder/quote-breakdown";
import { getQuoteByToken } from "@/services/quote-access";
import { quotePdfUrl } from "@/services/quote-access-urls";
import type { QuoteStatus } from "@/types/quote";

export const metadata: Metadata = {
  title: "Cotización",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

const statusLabels: Record<QuoteStatus, string> = {
  needs_review: "En revisión",
  issued: "Emitida",
  sent: "Enviada",
  approved: "Aprobada",
  rejected: "Rechazada",
  expired: "Vencida",
  cancelled: "Cancelada",
};

const dateFormat = new Intl.DateTimeFormat("es-MX", { dateStyle: "long" });

export default function QuotePage({ params }: PageProps<"/cotizacion/[token]">) {
  return (
    <section className="bg-tint pt-28 pb-24 sm:pt-32">
      <Container className="max-w-4xl">
        {/* El token es un dato de la solicitud: se resuelve dentro de Suspense (Cache Components). */}
        <Suspense fallback={<Skeleton className="h-[600px] w-full rounded-2xl" />}>
          <QuoteDocument params={params} />
        </Suspense>
      </Container>
    </section>
  );
}

async function QuoteDocument({ params }: { params: PageProps<"/cotizacion/[token]">["params"] }) {
  const { token } = await params;
  const result = await getQuoteByToken(token);

  if (result.status !== "ok") {
    const expired = result.status === "expired";
    const Icon = expired ? TimerOff : FileQuestion;
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card shadow-card px-6 py-14 text-center">
        <Icon className="mx-auto mb-4 size-10 text-electric" aria-hidden />
        <h1 className="font-heading text-2xl font-semibold">
          {expired
            ? "Este enlace ha vencido"
            : result.status === "error"
              ? "No pudimos cargar la cotización"
              : "Cotización no encontrada"}
        </h1>
        <p className="mt-2 text-foreground-secondary">
          {expired
            ? "Solicita una actualización y te enviaremos una cotización con precios vigentes."
            : result.status === "error"
              ? "Inténtalo de nuevo en unos minutos."
              : "Verifica que el enlace esté completo."}
        </p>
        <Button asChild variant="brand" size="xl" className="mt-6">
          <Link href="/contacto">Contactar a un asesor</Link>
        </Button>
      </div>
    );
  }

  const { quote } = result;
  const final = quote.calculation.isFinal && quote.status !== "expired";

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button asChild variant="glass">
          <a href={quotePdfUrl(token)} target="_blank" rel="noopener noreferrer">
            <FileDown data-icon="inline-start" /> {final ? "Descargar PDF" : "Descargar PDF preliminar"}
          </a>
        </Button>
      </div>
      <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-elevated">
        <header className="flex flex-col gap-6 border-t-4 border-b border-t-navy border-b-border bg-mist px-6 py-8 sm:flex-row sm:items-start sm:justify-between sm:px-10">
          <div className="flex items-center gap-3">
            <LogoMark className="size-10" />
            <div>
              <p className="font-heading text-lg font-semibold">{quote.business.tradeName}</p>
              <p className="text-sm text-muted-foreground">{final ? "Cotización" : "Solicitud de cotización"}</p>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:text-right">
            <dt className="text-muted-foreground">Folio</dt>
            <dd className="font-mono font-semibold">{quote.folio}</dd>
            <dt className="text-muted-foreground">Fecha</dt>
            <dd>{dateFormat.format(new Date(quote.createdAt))}</dd>
            <dt className="text-muted-foreground">Vigencia</dt>
            <dd>{quote.validUntil ? dateFormat.format(new Date(quote.validUntil)) : "Por definir"}</dd>
            <dt className="text-muted-foreground">Estado</dt>
            <dd>
              <span className="rounded-full bg-royal/15 px-2.5 py-0.5 text-xs text-electric">
                {statusLabels[quote.status]}
              </span>
            </dd>
          </dl>
        </header>

        <div className="space-y-8 px-6 py-8 sm:px-10">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs tracking-wide text-muted-foreground uppercase">Cliente</p>
              <p className="mt-1 font-medium">{quote.client.name}</p>
              {quote.client.company && <p className="text-foreground-secondary">{quote.client.company}</p>}
            </div>
            <div>
              <p className="text-xs tracking-wide text-muted-foreground uppercase">Solución</p>
              <p className="mt-1 font-medium">{quote.calculation.package?.name ?? "Solución personalizada"}</p>
              {quote.version > 1 && <p className="text-sm text-muted-foreground">Versión {quote.version}</p>}
            </div>
          </div>

          <QuoteBreakdown calculation={quote.calculation} />

          {quote.terms.length > 0 && (
            <section className="border-t border-border pt-6">
              <h2 className="mb-3 font-heading text-base font-semibold">Condiciones</h2>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-foreground-secondary">
                {quote.terms.map((term) => (
                  <li key={term}>{term}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </article>
    </>
  );
}
