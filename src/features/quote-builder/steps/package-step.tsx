"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, Columns3, PencilRuler } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MonthlyTag, PriceTag } from "@/features/packages/package-card";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { quoteApi } from "@/services/quotes";
import { PaymentModeToggle, StepHeader } from "../controls";
import { INFRASTRUCTURE_SLUGS, SOLUTION_CATEGORIES, useQuoteStore } from "../store";

export function PackageStep() {
  const { solution, packageSlug, paymentMode, choosePackage, setPaymentMode, goTo } = useQuoteStore();
  const [compare, setCompare] = useState(false);
  const { data, isPending, isError } = useQuery({ queryKey: ["packages"], queryFn: quoteApi.packages });
  const componentsQuery = useQuery({ queryKey: ["public-components"], queryFn: quoteApi.components });
  // Dominio y hosting: van con todo paquete, aparte del precio, una vez al año.
  const infrastructure = (componentsQuery.data ?? []).filter((c) => INFRASTRUCTURE_SLUGS.includes(c.slug));
  const infrastructureCents =
    infrastructure.length > 0 && infrastructure.every((c) => c.pricing.amountCents !== null)
      ? infrastructure.reduce((sum, c) => sum + c.pricing.amountCents!, 0)
      : null;
  const infrastructureNote = infrastructureCents !== null ? `Dominio y hosting ${formatMoney(infrastructureCents)} al año, aparte.` : null;

  const categories = SOLUTION_CATEGORIES[solution ?? "unsure"];
  const packages = (data ?? [])
    .filter((p) => categories.includes(p.category))
    // Para "landing" se muestra primero el paquete de landing page.
    .sort((a, b) => Number(solution === "landing" && b.slug.startsWith("landing")) - Number(solution === "landing" && a.slug.startsWith("landing")));
  const offersRent = packages.some((p) => p.subscription);
  const renting = paymentMode === "subscription" && offersRent;
  const visible = renting ? packages.filter((p) => p.subscription) : packages;

  const choose = (slug: string | null) => {
    if (slug !== packageSlug) choosePackage(slug);
    goTo(4);
  };

  const allFeatures = [...new Set(visible.flatMap((p) => p.features))];

  return (
    <div>
      <StepHeader title="Elige un punto de partida" description="Selecciona un paquete para personalizarlo, o comienza desde cero." />
      {isError && <p className="mb-4 text-sm text-destructive">No pudimos cargar los paquetes. Puedes comenzar desde cero.</p>}

      {offersRent && <PaymentModeToggle value={paymentMode} onChange={setPaymentMode} className="mb-5 max-w-xl" />}

      {visible.length > 1 && (
        <Button variant="glass" className="mb-5 h-9 rounded-lg" onClick={() => setCompare((v) => !v)} aria-expanded={compare}>
          <Columns3 data-icon="inline-start" /> {compare ? "Ocultar comparación" : "Comparar paquetes"}
        </Button>
      )}

      {compare && visible.length > 1 && (
        <div className="mb-6 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[560px] text-sm">
            <caption className="sr-only">Comparación de paquetes</caption>
            <thead className="bg-surface-raised/70">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground">Característica</th>
                {visible.map((p) => (
                  <th key={p.slug} scope="col" className="px-4 py-3 text-left font-heading font-semibold">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <th scope="row" className="px-4 py-3 text-left font-normal text-muted-foreground">{renting ? "Mensualidad" : "Precio inicial"}</th>
                {visible.map((p) => (
                  <td key={p.slug} className="px-4 py-3">
                    {renting && p.subscription ? <MonthlyTag offer={p.subscription} /> : <PriceTag pricing={p.pricing} size="sm" />}
                  </td>
                ))}
              </tr>
              {infrastructureCents !== null && (
                <tr>
                  <th scope="row" className="px-4 py-2.5 text-left font-normal text-foreground-secondary">
                    Dominio y hosting (aparte; se descuenta si ya los tienes)
                  </th>
                  {visible.map((p) => (
                    <td key={p.slug} className="px-4 py-2.5 whitespace-nowrap">
                      {formatMoney(infrastructureCents)} <span className="text-xs text-muted-foreground">/ año</span>
                    </td>
                  ))}
                </tr>
              )}
              {allFeatures.map((feature) => (
                <tr key={feature}>
                  <th scope="row" className="px-4 py-2.5 text-left font-normal text-foreground-secondary">{feature}</th>
                  {visible.map((p) => (
                    <td key={p.slug} className="px-4 py-2.5">
                      {p.features.includes(feature) ? (
                        <Check className="size-4 text-electric" aria-label="Incluido" />
                      ) : (
                        <span className="text-muted-foreground" aria-label="No incluido">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {isPending
          ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)
          : visible.map((p) => (
              <article
                key={p.slug}
                className={cn(
                  "flex flex-col rounded-2xl border bg-card p-6 transition-colors",
                  packageSlug === p.slug ? "border-royal bg-royal/10" : "border-border hover:border-electric/40",
                )}
              >
                <h3 className="font-heading text-xl font-semibold">{p.name}</h3>
                <p className="mt-1 mb-4 text-sm text-foreground-secondary">{p.summary}</p>
                {renting && p.subscription ? (
                  <>
                    <MonthlyTag offer={p.subscription} size="lg" />
                    {p.subscription.softwareOnly && <p className="mt-1 text-xs text-muted-foreground">Solo el software, sin equipo.</p>}
                    {p.subscription.hardwareUpfront && <p className="mt-1 text-xs text-muted-foreground">Más el equipo, de contado.</p>}
                  </>
                ) : (
                  <PriceTag pricing={p.pricing} />
                )}
                {infrastructureNote && <p className="mt-1 text-xs text-muted-foreground">{infrastructureNote}</p>}
                <ul className="mt-4 mb-6 space-y-1.5 text-sm text-foreground-secondary">
                  {p.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-electric" aria-hidden /> {f}
                    </li>
                  ))}
                  {p.features.length > 5 && <li className="pl-6 text-muted-foreground">y {p.features.length - 5} más</li>}
                </ul>
                <Button
                  variant={packageSlug === p.slug ? "brand" : "glass"}
                  className="mt-auto h-11 rounded-xl"
                  onClick={() => choose(p.slug)}
                  disabled={renting && !p.subscription}
                >
                  Personalizar <ArrowRight data-icon="inline-end" />
                </Button>
              </article>
            ))}

        <article className="flex flex-col rounded-2xl border border-dashed border-border bg-canvas p-6">
          <PencilRuler className="mb-3 size-6 text-electric" aria-hidden />
          <h3 className="font-heading text-xl font-semibold">Comenzar desde cero</h3>
          <p className="mt-1 mb-6 text-sm text-foreground-secondary">
            Arma tu solución componente por componente. Se cotiza tras una valoración personalizada{renting ? " y solo en compra" : ""}.
          </p>
          <Button variant="glass" className="mt-auto h-11 rounded-xl" onClick={() => choose(null)}>
            Armar desde cero <ArrowRight data-icon="inline-end" />
          </Button>
        </article>
      </div>
    </div>
  );
}
