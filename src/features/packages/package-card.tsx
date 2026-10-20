import { ArrowRight, CalendarClock, Check, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PackageCategory, PublicPackage, PublicPricing, PublicSubscriptionOffer } from "@/types/catalog";

export const categoryLabels: Record<PackageCategory, string> = {
  web: "Desarrollo web",
  ecommerce: "E-commerce",
  pos: "Punto de venta",
  combo: "Paquete combinado",
  custom: "A la medida",
};

export function PriceTag({ pricing, size = "lg" }: { pricing: PublicPricing; size?: "sm" | "lg" }) {
  if (pricing.pendingPricing || pricing.amountCents === null || pricing.mode === "on_request") {
    return (
      <p className={cn("inline-flex items-center gap-2 font-medium text-foreground-secondary", size === "lg" ? "text-lg" : "text-sm")}>
        <Clock className="size-4 text-electric" aria-hidden />
        {pricing.pendingPricing ? "Por cotizar" : "Sujeto a valoración"}
      </p>
    );
  }

  return (
    <p className="flex items-baseline gap-2">
      {pricing.mode === "starting_at" && <span className="text-sm text-muted-foreground">Desde</span>}
      <span className={cn("font-heading font-semibold tracking-tight text-foreground", size === "lg" ? "text-4xl" : "text-lg")}>
        {formatMoney(pricing.amountCents)}
      </span>
      <span className="text-sm text-muted-foreground">MXN</span>
    </p>
  );
}

/** Mensualidad de la suscripción ("Renta desde $946 / mes"). */
export function MonthlyTag({ offer, size = "sm" }: { offer: PublicSubscriptionOffer; size?: "sm" | "lg" }) {
  const { pricing } = offer;
  if (pricing.pendingPricing || pricing.amountCents === null) {
    return (
      <p className={cn("inline-flex items-center gap-2 text-foreground-secondary", size === "lg" ? "text-lg font-medium" : "text-sm")}>
        <CalendarClock className="size-4 text-electric" aria-hidden />
        Renta mensual por confirmar
      </p>
    );
  }
  return (
    <p className="flex flex-wrap items-baseline gap-x-1.5">
      <span className="text-sm text-muted-foreground">{pricing.mode === "starting_at" ? "Renta desde" : "Renta"}</span>
      <span className={cn("font-heading font-semibold tracking-tight text-foreground", size === "lg" ? "text-4xl" : "text-lg")}>
        {formatMoney(pricing.amountCents)}
      </span>
      <span className="text-sm text-muted-foreground">MXN / mes</span>
    </p>
  );
}

export interface PlanSettings {
  minimumTermMonths: number;
  monthToMonthSurchargeBp: number;
  semiannualDiscountBp: number;
  annualDiscountBp: number;
}

/** Planes disponibles, en una línea. */
export function plansSummary(plans: PlanSettings): string {
  const pct = (bp: number) => `${bp / 100} %`;
  return `Mensual, semestral cada 6 meses (−${pct(plans.semiannualDiscountBp)}) o anual cada 12 meses (−${pct(plans.annualDiscountBp)}).`;
}

/** Qué cubre la mensualidad, en una línea. */
export function subscriptionSummary(offer: PublicSubscriptionOffer): string {
  if (offer.softwareOnly) {
    const annual = offer.infrastructureAnnualCents != null ? `dominio y hosting ${formatMoney(offer.infrastructureAnnualCents)} al año` : null;
    const parts = ["Solo el software, sin equipo", "soporte al usuario incluido", annual].filter(Boolean);
    return `${parts.join(" · ")}.`;
  }
  const covers = [
    offer.includesHosting && "hosting",
    offer.storageGb > 0 && `${offer.storageGb} GB de almacenamiento`,
    offer.includesDomain && "dominio",
    "mantenimiento",
  ].filter(Boolean);
  const parts = [`Incluye ${covers.join(", ")}`];
  if (offer.hardwareUpfront) parts.push("el equipo se paga de contado");
  return `${parts.join(" · ")}.`;
}

export function PackageCard({ pkg, plans }: { pkg: PublicPackage; plans: PlanSettings }) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-7 text-foreground shadow-card transition-[border-color,transform,box-shadow] duration-300",
        "hover:-translate-y-1 hover:border-royal/40 hover:shadow-elevated motion-reduce:hover:translate-y-0",
        pkg.featured ? "border-royal/50 ring-1 ring-royal/20" : "border-border",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-royal to-transparent opacity-0 transition-opacity group-hover:opacity-100"
      />
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{categoryLabels[pkg.category]}</Badge>
          {pkg.featured && <Badge className="bg-sky text-royal">Recomendado</Badge>}
        </div>
        <h3 className="font-heading text-2xl font-semibold text-navy">{pkg.name}</h3>
        <p className="text-sm leading-relaxed text-foreground-secondary">{pkg.summary}</p>
      </header>

      <div className="my-6">
        <PriceTag pricing={pkg.pricing} />
        <p className="mt-1 text-xs text-muted-foreground">Importe en MXN. La cotización formal indica las condiciones.</p>
        {pkg.subscription && (
          <div className="mt-4 rounded-xl border border-border bg-mist px-4 py-3">
            <MonthlyTag offer={pkg.subscription} />
            <p className="mt-1 text-xs text-muted-foreground">{subscriptionSummary(pkg.subscription)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{plansSummary(plans)}</p>
            <Link
              href={`/cotizador?paquete=${encodeURIComponent(pkg.slug)}&modalidad=suscripcion`}
              className="mt-2 inline-flex text-xs font-medium text-electric underline underline-offset-4"
            >
              Cotizar en renta mensual
            </Link>
          </div>
        )}
      </div>

      {pkg.includesPackages.length > 0 && (
        <p className="mb-4 text-sm text-foreground-secondary">
          Incluye: {pkg.includesPackages.map((item) => item.name).join(" + ")}
        </p>
      )}

      <ul className="mb-6 space-y-2.5 text-sm">
        {pkg.features.map((feature) => (
          <li key={feature} className="flex gap-2.5">
            <Check className="mt-0.5 size-4 shrink-0 text-electric" aria-hidden />
            <span className="text-foreground-secondary">{feature}</span>
          </li>
        ))}
      </ul>

      {pkg.variants.length > 0 && (
        <div className="mb-6 space-y-2 rounded-xl border border-border bg-mist p-4">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Variantes</p>
          <ul className="space-y-2">
            {pkg.variants.map((variant) => (
              <li key={variant.slug} className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <span className="text-foreground-secondary">{variant.name}</span>
                <PriceTag pricing={variant.pricing} size="sm" />
              </li>
            ))}
          </ul>
        </div>
      )}

      {pkg.notes.length > 0 && (
        <ul className="mb-6 space-y-1 text-xs text-muted-foreground">
          {pkg.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}

      <Button asChild variant={pkg.featured ? "brand" : "glass"} size="xl" className="mt-auto w-full">
        <Link href={`/cotizador?paquete=${encodeURIComponent(pkg.slug)}`}>
          Personalizar y cotizar
          <ArrowRight data-icon="inline-end" />
        </Link>
      </Button>
    </article>
  );
}
