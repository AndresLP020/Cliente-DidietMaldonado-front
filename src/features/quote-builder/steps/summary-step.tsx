"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StepHeader } from "../controls";
import { QuoteBreakdown } from "../quote-breakdown";
import { useQuoteStore } from "../store";
import { useQuotePreview } from "../use-quote-preview";

export function SummaryStep() {
  const goTo = useQuoteStore((s) => s.goTo);
  const { data, isPending, error } = useQuotePreview();

  return (
    <div className="mx-auto max-w-3xl">
      <StepHeader
        title="Resumen económico"
        description="Importes calculados por nuestro sistema con los precios vigentes. Los servicios recurrentes se muestran por separado."
      />
      {error ? (
        <p role="alert" className="text-destructive">No pudimos calcular el presupuesto. Vuelve al paso anterior e inténtalo de nuevo.</p>
      ) : isPending || !data ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-card p-5 sm:p-7">
          {data.package && <p className="mb-5 font-heading text-xl font-semibold">{data.package.name}</p>}
          <QuoteBreakdown calculation={data} />
        </div>
      )}
      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="glass" size="xl" onClick={() => goTo(4)}>
          <ArrowLeft data-icon="inline-start" /> Ajustar selección
        </Button>
        <Button variant="brand" size="xl" onClick={() => goTo(6)} disabled={!data}>
          {data?.status === "blocked" ? "Solicitar valoración" : "Continuar"} <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </div>
  );
}
