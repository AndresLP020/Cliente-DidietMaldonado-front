"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CircleCheck, Undo2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { PriceTag } from "@/features/packages/package-card";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { quoteApi } from "@/services/quotes";
import type { PackageCategory } from "@/types/catalog";
import type { PublicComponent } from "@/types/quote";
import { ChoiceCard, PaymentModeToggle, PlanPicker, QuantityStepper, StepHeader } from "../controls";
import { LiveSummary, MobileSummaryBar } from "../live-summary";
import { RecurringComparison, recurringScope } from "../recurring-comparison";
import { INFRASTRUCTURE_SLUGS, useQuoteStore } from "../store";
import { useQuotePreview } from "../use-quote-preview";

/**
 * Categorías de complementos por tipo de paquete, solo para paquetes que no definen sus
 * complementos compatibles (reduce ruido; el backend valida igual).
 */
const ADDON_CATEGORIES: Record<PackageCategory | "scratch", string[]> = {
  web: ["desarrollo-web", "redes-contacto", "servicios-implementacion"],
  ecommerce: ["modulos-tienda", "redes-contacto"],
  pos: ["modulos-pos", "hardware-pos"],
  combo: ["modulos-tienda", "modulos-pos", "redes-contacto", "hardware-pos"],
  custom: ["servicios-implementacion"],
  scratch: ["desarrollo-web", "redes-contacto", "ecommerce", "hardware-pos", "servicios-implementacion"],
};

export function CustomizeStep() {
  const store = useQuoteStore();
  const { packageSlug, fromScratch } = store;

  const detailQuery = useQuery({
    queryKey: ["package-detail", packageSlug],
    queryFn: () => quoteApi.packageDetail(packageSlug!),
    enabled: packageSlug !== null,
  });
  const componentsQuery = useQuery({ queryKey: ["public-components"], queryFn: quoteApi.components });
  const preview = useQuotePreview();

  const detail = detailQuery.data;
  const category: PackageCategory | "scratch" = detail?.category ?? "scratch";
  const included = preview.data?.includedItems ?? [];
  const includedQty = (slug: string) =>
    included.filter((i) => i.componentSlug === slug && !i.removed).reduce((sum, i) => sum + i.quantity, 0);
  const blocked = new Map((preview.data?.blockingIssues ?? []).map((i) => [i.componentSlug, i.message]));

  const all = componentsQuery.data ?? [];
  const packageAddOns = detail?.addOns ?? [];
  // Solo lo que se puede agregar: lo ya incluido no se ofrece de nuevo (salvo unidades extra).
  const oneTime = (packageAddOns.length > 0 ? packageAddOns : all.filter((c) => ADDON_CATEGORIES[category].includes(c.category.slug))).filter(
    (c) => c.billing === "one_time" && (includedQty(c.slug) === 0 || c.maxQuantity > 1),
  );
  const chosen = new Set([
    ...included.filter((i) => !i.removed).map((i) => i.componentSlug),
    ...Object.entries(store.quantities).filter(([, qty]) => qty > 0).map(([slug]) => slug),
  ]);
  const renting = store.paymentMode === "subscription" && Boolean(detail?.subscription);
  // En suscripción, lo que cubre la mensualidad no se contrata aparte.
  const coveredByRent = new Set(renting ? detail?.subscriptionIncludedServices : []);
  // Dominio y hosting van con todo paquete: se muestran aparte, solo para indicar si el cliente ya los tiene.
  const infrastructure = INFRASTRUCTURE_SLUGS.flatMap((slug) => all.filter((c) => c.slug === slug));
  const recurring = all.filter((c) => c.billing !== "one_time" && !coveredByRent.has(c.slug) && !INFRASTRUCTURE_SLUGS.includes(c.slug));
  // Importe que calcula el backend: una sola línea anual (en renta, el cargo anual). 0 = el cliente ya tiene ambos.
  const infrastructureCents = !preview.data
    ? null
    : preview.data.subscription
      ? (preview.data.subscription.annualCharge?.cents ?? 0)
      : (preview.data.recurring.find((r) => r.componentSlug === "domain-hosting")?.amountCents ?? 0);
  const recommended = new Set(detail?.recommendedRecurring.map((c) => c.slug));
  const maintenanceSlugs = new Set(["maintenance-web-basic", "maintenance-web-business", "maintenance-ecommerce", "support-pos"]);
  const annexed = new Set([...(detail?.recommendedRecurring ?? [])].filter((c) => maintenanceSlugs.has(c.slug)).map((c) => c.slug));
  const annexedGroups = new Set(
    (detail?.recommendedRecurring ?? []).filter((c) => annexed.has(c.slug) && c.exclusiveGroup).map((c) => c.exclusiveGroup!),
  );
  const recurringSorted = [...recurring].sort((a, b) => Number(recommended.has(b.slug)) - Number(recommended.has(a.slug)));
  const webMaintenance = recurringSorted.filter((c) => c.exclusiveGroup === "web-maintenance");
  const byCategory = groupBy(oneTime, (c) => c.category.name);

  if (!packageSlug && !fromScratch) {
    return <p className="text-foreground-secondary">Primero elige un paquete o comienza desde cero.</p>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0 space-y-10">
        <StepHeader
          title={detail ? `Personaliza ${detail.name}` : "Arma tu solución"}
          description="Agrega lo que necesitas y retira lo que no. Lo que ya está incluido no se cobra dos veces."
        />

        {packageSlug && detailQuery.isPending && <Skeleton className="h-40 rounded-2xl" />}

        {detail?.subscription && (
          <section aria-label="Modalidad de pago" className="space-y-2">
            <PaymentModeToggle value={store.paymentMode} onChange={store.setPaymentMode} />
            {renting && preview.data?.subscription && (
              <PlanPicker plans={preview.data.subscription.plans} value={store.subscriptionPlan} onChange={store.setSubscriptionPlan} />
            )}
            {renting && (
              <p className="text-xs text-muted-foreground">
                Pagas una mensualidad en lugar del precio del paquete. El mantenimiento ya va dentro de esa mensualidad. El dominio y hosting del año se cobran en el primer pago, junto con los cargos de contado, así que ese pago puede ser distinto de los siguientes. El semestral es cada 6 meses; el anual, cada 12.
                Los complementos{detail.subscription.hardwareUpfront ? " y el equipo" : ""} se
                pagan de contado; cambiar variantes o retirar componentes requiere ajustar la mensualidad con un asesor.
              </p>
            )}
          </section>
        )}

        {/* Variantes: una opción por grupo */}
        {detail && detail.category !== "combo" && detail.variantGroups.length > 0 && (
          <section aria-labelledby="variants-title" className="space-y-4">
            <h3 id="variants-title" className="font-heading text-lg font-semibold">Variantes</h3>
            {detail.variantGroups.map((group) => {
              const current = store.variants[group.key] ?? group.defaultOption;
              return (
                <fieldset key={group.key} className="space-y-3">
                  <legend className="mb-2 text-sm text-muted-foreground">{group.name}</legend>
                  <div role="radiogroup" aria-label={group.name} className="grid gap-3 sm:grid-cols-2">
                    {group.options.map((option) => (
                      <ChoiceCard key={option.key} selected={current === option.key} onSelect={() => store.setVariant(group.key, option.key)}>
                        <span className="pr-6 font-medium">{option.name}</span>
                        <span className="mt-2"><PriceTag pricing={option.pricing} size="sm" /></span>
                      </ChoiceCard>
                    ))}
                  </div>
                </fieldset>
              );
            })}
          </section>
        )}

        {detail?.category === "combo" && (
          <p className="rounded-xl border border-border bg-card shadow-card px-4 py-3 text-sm text-foreground-secondary">
            Incluye: {detail.includedPackages.map((p) => p.name).join(" + ")}, con catálogo, inventario y clientes compartidos. Esa conexión
            es parte de la solución y no se cobra aparte.
          </p>
        )}

        {/* Componentes incluidos */}
        {included.length > 0 && (
          <section aria-labelledby="included-title" className="space-y-3">
            <h3 id="included-title" className="font-heading text-lg font-semibold">Incluye</h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              {included.map((item) => (
                <li
                  key={`${item.fromPackage}-${item.componentSlug}`}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm",
                    item.removed ? "border-dashed border-border text-muted-foreground line-through" : "border-border bg-card",
                  )}
                >
                  <span className="flex items-center gap-2">
                    {!item.removed && <CircleCheck className="size-4 shrink-0 text-electric" aria-hidden />}
                    {item.name}
                    {item.quantity > 1 && <span className="text-muted-foreground no-underline">× {item.quantity}</span>}
                  </span>
                  {item.removable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 no-underline"
                      onClick={() => store.toggleRemoved(item.componentSlug)}
                      aria-label={item.removed ? `Conservar ${item.name}` : `Retirar ${item.name}`}
                    >
                      {item.removed ? <><Undo2 /> Conservar</> : <><X /> Retirar</>}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
            {store.removed.length > 0 && (
              <p className="text-xs text-muted-foreground">Al retirar un componente se aplica solo el crédito aprobado para ese componente.</p>
            )}
          </section>
        )}

        {/* Complementos */}
        <section aria-labelledby="addons-title" className="space-y-6">
          <div>
            <h3 id="addons-title" className="font-heading text-lg font-semibold">Puedes agregar</h3>
            <p className="text-sm text-muted-foreground">
              Lo marcado «Por cotizar» aún no tiene precio aprobado: se incluye en tu solicitud y un asesor lo valora.
            </p>
          </div>
          {componentsQuery.isPending && <Skeleton className="h-60 rounded-2xl" />}
          {!componentsQuery.isPending && oneTime.length === 0 && (
            <p className="text-sm text-muted-foreground">Este paquete no tiene adicionales disponibles.</p>
          )}
          {Object.entries(byCategory).map(([name, items]) => (
            <div key={name} className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">{name}</h4>
              <ul className="divide-y divide-border rounded-2xl border border-border bg-card shadow-card">
                {items.map((component) => (
                  <AddOnRow
                    key={component.slug}
                    component={component}
                    included={includedQty(component.slug)}
                    value={store.quantities[component.slug] ?? includedQty(component.slug)}
                    blockedMessage={blocked.get(component.slug)}
                    missing={(component.requires ?? []).every((r) => !chosen.has(r.slug)) ? component.requires ?? [] : []}
                    onChange={(qty) => store.setQuantity(component.slug, qty)}
                  />
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Dominio y hosting: con todo paquete; se descuenta lo que el cliente ya tiene */}
        {packageSlug && infrastructure.length > 0 && (
          <section aria-labelledby="infrastructure-title" className="space-y-3">
            <div>
              <h3 id="infrastructure-title" className="font-heading text-lg font-semibold">Dominio y hosting</h3>
              <p className="text-sm text-muted-foreground">
                Van con el paquete y se pagan aparte, una vez al año{renting ? ", en el primer pago" : ""}. Si ya cuentas con alguno, márcalo y no
                se cobra.
              </p>
            </div>
            <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border bg-card shadow-card px-4 py-3">
              <div className="min-w-0">
                <span className="text-sm font-medium">Dominio y hosting</span>{" "}
                {infrastructureCents !== 0 && <Badge className="ml-1 bg-royal/15 text-electric">Incluido con el paquete</Badge>}
                <span className="mt-1 block text-xs text-muted-foreground">Nombre del sitio y servidor donde se publica, por un año.</span>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                  {infrastructure.map((component) => (
                    <label key={component.slug} className="flex cursor-pointer items-center gap-2 text-xs text-foreground-secondary">
                      <Checkbox
                        checked={store.clientProvided.includes(component.slug)}
                        onCheckedChange={() => store.toggleClientProvided(component.slug)}
                      />
                      Ya tengo {component.name.toLowerCase()} propio
                    </label>
                  ))}
                </div>
              </div>
              <span className="shrink-0 text-right text-sm">
                {infrastructureCents === 0 ? (
                  <span className="text-muted-foreground">No se cobra</span>
                ) : infrastructureCents != null ? (
                  <>
                    {formatMoney(infrastructureCents)}
                    <span className="text-xs text-muted-foreground"> / año</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">…</span>
                )}
              </span>
            </div>
          </section>
        )}

        {/* Servicios recurrentes */}
        <section aria-labelledby="recurring-title" className="space-y-3">
          <div>
            <h3 id="recurring-title" className="font-heading text-lg font-semibold">Mantenimiento y servicios recurrentes</h3>
            <p className="text-sm text-muted-foreground">
              {renting
                ? "La mensualidad ya incluye el soporte al usuario. El dominio y el hosting se cobran aparte, una vez al año."
                : "El mantenimiento del paquete se cobra cada mes y ya va incluido. Los demás servicios son opcionales: compara qué cubre cada uno."}
            </p>
          </div>
          {webMaintenance.length > 1 && (
            <p className="text-sm text-foreground-secondary">
              El mantenimiento del sitio es uno solo: el precio sube por lo que cubre. Los demás servicios de esta lista se agregan aparte.
            </p>
          )}
          <RecurringComparison services={webMaintenance} selected={store.recurring} />
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card shadow-card">
            {recurringSorted.map((component) => {
              const includedWithPackage = !renting && annexed.has(component.slug);
              const replacedByPackage = !renting && !includedWithPackage && Boolean(component.exclusiveGroup && annexedGroups.has(component.exclusiveGroup));
              const checked = includedWithPackage || store.recurring.includes(component.slug);
              const scope = recurringScope(component.slug);
              const exclusiveWith = component.exclusiveGroup
                ? recurring.filter((c) => c.exclusiveGroup === component.exclusiveGroup && c.slug !== component.slug).map((c) => c.slug)
                : [];
              const message = blocked.get(component.slug);
              return (
                <li key={component.slug} className="flex items-start justify-between gap-3 px-4 py-3">
                  <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                    <Checkbox
                      checked={checked}
                      disabled={includedWithPackage || replacedByPackage}
                      onCheckedChange={() => {
                        if (includedWithPackage || replacedByPackage) return;
                        store.toggleRecurring(component.slug, exclusiveWith);
                      }}
                      className="mt-0.5"
                      aria-describedby={message ? `${component.slug}-issue` : undefined}
                    />
                    <span className="min-w-0">
                      <span className="text-sm font-medium">{component.name}</span>{" "}
                      {includedWithPackage && <Badge className="ml-1 bg-royal/15 text-electric">Incluido con el paquete</Badge>}
                      {!includedWithPackage && recommended.has(component.slug) && <Badge className="ml-1 bg-royal/15 text-electric">Recomendado</Badge>}
                      {scope && (
                        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                          {scope.includes.join(" · ")}
                          <span className="mt-0.5 block text-foreground-secondary">{scope.why}</span>
                        </span>
                      )}
                      {message && <IssueText id={`${component.slug}-issue`} message={message} />}
                    </span>
                  </label>
                  <span className="shrink-0 text-right text-sm">
                    <PriceTag pricing={component.pricing} size="sm" />
                    {component.pricing.amountCents !== null && component.billing === "monthly" && (
                      <span className="text-xs text-muted-foreground"> / mes</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Espacio para que la barra fija móvil no tape el último elemento. */}
        <div aria-hidden className="h-16 lg:hidden" />
        <MobileSummaryBar />
      </div>

      <div className="hidden lg:block">
        <LiveSummary className="sticky top-24" />
      </div>
    </div>
  );
}

function AddOnRow({
  component,
  included,
  value,
  blockedMessage,
  missing,
  onChange,
}: {
  component: PublicComponent;
  included: number;
  value: number;
  blockedMessage?: string;
  /** Módulos requeridos que aún no están en la cotización. */
  missing: NonNullable<PublicComponent["requires"]>;
  onChange: (quantity: number) => void;
}) {
  const quantifiable = component.maxQuantity > 1 || included > 0;
  const max = included + component.maxQuantity;
  const issueId = `${component.slug}-issue`;

  return (
    <li className={cn("flex flex-wrap items-center justify-between gap-3 px-4 py-3", blockedMessage && "bg-magenta/5")}>
      <div className="flex min-w-0 items-start gap-3">
        {!quantifiable && (
          <Checkbox
            id={`addon-${component.slug}`}
            checked={value > 0}
            onCheckedChange={(checked) => onChange(checked === true ? 1 : 0)}
            className="mt-0.5"
            aria-describedby={blockedMessage ? issueId : undefined}
          />
        )}
        <div className="min-w-0">
          <label htmlFor={quantifiable ? undefined : `addon-${component.slug}`} className="cursor-pointer text-sm font-medium">
            {component.name}
          </label>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <PriceTag pricing={component.pricing} size="sm" />
            {component.pricing.amountCents !== null && quantifiable && <span>por {component.unit}</span>}
            {included > 0 && <Badge variant="secondary">{included} incluidas</Badge>}
            {component.requiresEvaluation && <Badge variant="outline">Requiere valoración</Badge>}
            {missing.length > 0 && <Badge variant="outline">Requiere otro módulo: {missing.map((m) => m.name).join(" o ")}</Badge>}
          </div>
          {component.description && <p className="mt-1 text-xs text-muted-foreground">{component.description}</p>}
          {blockedMessage && <IssueText id={issueId} message={blockedMessage} />}
        </div>
      </div>
      {/* No se baja de lo incluido: reducirlo no genera crédito. */}
      {quantifiable && <QuantityStepper value={value} min={included} max={max} onChange={onChange} label={component.name} />}
    </li>
  );
}

function IssueText({ id, message }: { id: string; message: string }) {
  return (
    <span id={id} className="mt-1 flex items-center gap-1.5 text-xs text-magenta">
      <AlertTriangle className="size-3.5 shrink-0" aria-hidden /> {message}
    </span>
  );
}

function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    (acc[key(item)] ??= []).push(item);
    return acc;
  }, {});
}
