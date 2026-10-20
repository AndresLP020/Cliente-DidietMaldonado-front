import { AlertTriangle, CircleCheck, Info, MinusCircle } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { QuoteCalculation, QuoteLine, SubscriptionSummary } from "@/types/quote";

const billingLabels: Record<string, string> = {
  monthly: "/ mes",
  annual: "/ año",
  third_party_variable: "según proveedor",
};

export function Amount({ cents, className, pendingLabel = "Por valorar" }: { cents: number | null; className?: string; pendingLabel?: string }) {
  if (cents === null) return <span className={cn("text-sm text-muted-foreground italic", className)}>{pendingLabel}</span>;
  return <span className={cn("tabular-nums", className)}>{formatMoney(cents)}</span>;
}

function lineNote(line: QuoteLine): string | null {
  if (line.kind === "addon" && line.includedQuantity) return `${line.includedQuantity} incluidas · ${line.quantity} adicionales`;
  if (line.kind === "addon" && line.quantity > 1 && line.unitCents !== null) return `${line.quantity} × ${formatMoney(line.unitCents)}`;
  if (line.priceMode === "starting_at") return "Precio mínimo sujeto a evaluación";
  if (line.kind === "removal_credit" && line.amountCents === null) return "Crédito pendiente de aprobación";
  if (line.kind === "subscription_setup" && line.amountCents === null) return "Pendiente de cotizar";
  return null;
}

/** Desglose completo calculado por el backend. Solo presenta datos; no calcula. */
export function QuoteBreakdown({ calculation, compact = false }: { calculation: QuoteCalculation; compact?: boolean }) {
  const { totals, subscription } = calculation;
  const removed = calculation.includedItems.filter((i) => i.removed);
  const included = calculation.includedItems.filter((i) => !i.removed);

  return (
    <div className="space-y-6">
      <StatusNotice calculation={calculation} />

      {subscription && <SubscriptionBlock subscription={subscription} providedByClient={calculation.providedByClient ?? []} />}

      <section aria-label="Conceptos de pago único">
        <h3 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {subscription ? "Pago inicial (de contado)" : "Implementación (pago único)"}
        </h3>
        <ul className="divide-y divide-border rounded-xl border border-border">
          {calculation.lines.length === 0 && (
            <li className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
              <div>
                <p className="font-medium">Sin pago inicial</p>
                <p className="mt-0.5 text-xs text-muted-foreground">El paquete se cubre con la mensualidad.</p>
              </div>
              <Amount cents={0} className="shrink-0 font-medium" />
            </li>
          )}
          {calculation.lines.map((line, index) => {
            const note = lineNote(line);
            return (
              <li key={`${line.kind}-${line.componentSlug ?? index}`} className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className={cn("font-medium", line.kind === "removal_credit" && "text-foreground-secondary")}>{line.description}</p>
                  {note && <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>}
                </div>
                <Amount cents={line.amountCents} className="shrink-0 font-medium" />
              </li>
            );
          })}
        </ul>
      </section>

      {!compact && included.length > 0 && (
        <details className="group rounded-xl border border-border px-4 py-3 text-sm">
          <summary className="cursor-pointer font-medium text-foreground-secondary marker:text-electric">
            Componentes incluidos ({included.length})
          </summary>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {included.map((item) => (
              <li key={`${item.fromPackage}-${item.componentSlug}`} className="flex items-center gap-2 text-foreground-secondary">
                <CircleCheck className="size-3.5 shrink-0 text-electric" aria-hidden />
                {item.name}
                {item.quantity > 1 && <span className="text-muted-foreground">× {item.quantity}</span>}
              </li>
            ))}
          </ul>
        </details>
      )}

      {!compact && removed.length > 0 && (
        <div className="rounded-xl border border-border px-4 py-3 text-sm">
          <p className="mb-2 font-medium text-foreground-secondary">Componentes retirados</p>
          <ul className="space-y-1">
            {removed.map((item) => (
              <li key={item.componentSlug} className="flex items-center gap-2 text-muted-foreground">
                <MinusCircle className="size-3.5 shrink-0" aria-hidden />
                {item.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      <dl className="space-y-2 text-sm">
        <Row label="Subtotal" cents={totals.subtotalCents} />
        {totals.discountCents > 0 && <Row label="Descuentos" cents={-totals.discountCents} />}
        <div className="flex items-baseline justify-between border-t border-border pt-3">
          <dt className="font-heading text-base font-semibold">
            {subscription ? "Pago inicial" : "Total"}
            {totals.hasPendingAmounts ? " parcial" : ""}
          </dt>
          <dd className="font-heading text-2xl font-semibold">
            <Amount cents={totals.totalCents} />
          </dd>
        </div>
        <Row label={`Anticipo (${calculation.depositRateBp / 100} %)`} cents={totals.depositCents} muted />
        <Row label="Liquidación" cents={totals.balanceCents} muted />
      </dl>

      {calculation.comboSavingsCents !== null && calculation.comboSavingsCents > 0 && (
        <p className="rounded-lg bg-royal/10 px-3 py-2 text-xs text-electric">
          Este paquete combinado representa un ahorro de {formatMoney(calculation.comboSavingsCents)} frente a contratar sus paquetes por
          separado (ya reflejado en el precio).
        </p>
      )}

      {(calculation.recurring.length > 0 || (calculation.providedByClient ?? []).length > 0) && (
        <section aria-label="Servicios recurrentes">
          <h3 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {subscription ? "Servicios adicionales · aparte de la mensualidad" : "Servicios recurrentes · no incluidos en el total"}
          </h3>
          <ul className="divide-y divide-border rounded-xl border border-dashed border-border">
            {calculation.recurring.map((line) => (
              <li key={line.componentSlug} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <span>
                  {line.description}
                  {line.priceMode === "starting_at" && <span className="ml-1 text-xs text-muted-foreground">(desde)</span>}
                </span>
                <span className="shrink-0 text-right">
                  <Amount cents={line.amountCents} pendingLabel="Según proveedor" />{" "}
                  {line.amountCents !== null && <span className="text-xs text-muted-foreground">{billingLabels[line.billing]}</span>}
                </span>
              </li>
            ))}
            {(calculation.providedByClient ?? []).map((item) => (
              <li key={item.componentSlug} className="flex items-center justify-between gap-4 px-4 py-3 text-sm text-muted-foreground">
                <span>{item.name} · ya cuentas con uno</span>
                <span className="shrink-0 text-right">No se cobra</span>
              </li>
            ))}
          </ul>
          {totals.recurringMonthlyCents > 0 && (
            <p className="mt-2 text-right text-xs text-muted-foreground">
              Mensualidad estimada: {formatMoney(totals.recurringMonthlyCents)}
            </p>
          )}
        </section>
      )}
    </div>
  );
}

/** Lo que se cobra ahora: el primer pago, que puede incluir cargos de contado. */
export function subscriptionBudget(subscription: SubscriptionSummary): { label: string; cents: number | null } {
  return { label: "Primer pago", cents: subscription.firstPaymentCents };
}

function every(months: number): string {
  return months > 1 ? `cada ${months} meses` : "cada mes";
}

function SubscriptionBlock({
  subscription,
  providedByClient,
}: {
  subscription: SubscriptionSummary;
  providedByClient: NonNullable<QuoteCalculation["providedByClient"]>;
}) {
  const hosting = subscription.hostingCharge;
  return (
    <section aria-label="Suscripción mensual" className="space-y-3 rounded-xl border border-royal/40 bg-royal/10 p-4">
      <h3 className="text-xs font-medium tracking-wide text-electric uppercase">Suscripción mensual</h3>
      <dl className="space-y-2 text-sm">
        <div className="flex items-baseline justify-between">
          <dt>Plan</dt>
          <dd className="font-medium">{subscription.planLabel}</dd>
        </div>
        <Row label="Mensualidad" cents={subscription.monthlyCents} pendingLabel="Por confirmar" />
        {subscription.supportIncludedCents != null && (
          <p className="text-xs text-muted-foreground">
            El soporte al usuario durante todo el mes ({formatMoney(subscription.supportIncludedCents)}) ya va dentro de la mensualidad.
          </p>
        )}
        {subscription.annualCharge && (
          <Row label={`${subscription.annualCharge.name} · cada año`} cents={subscription.annualCharge.cents} />
        )}
        {hosting && (
          <Row
            label={hosting.upfront ? `${hosting.name} · en el primer pago` : `${hosting.name} · ${every(hosting.billingMonths)}`}
            cents={hosting.chargeCents}
            pendingLabel="Por confirmar"
          />
        )}
        <Row
          label={`Siguientes pagos · ${every(subscription.billingMonths)}`}
          cents={subscription.subsequentPaymentCents}
          pendingLabel="Por confirmar"
        />
        <div className="flex items-baseline justify-between border-t border-border pt-2">
          <dt className="font-heading font-semibold">Primer pago</dt>
          <dd className="font-heading text-2xl font-semibold">
            <Amount cents={subscription.firstPaymentCents} pendingLabel="Por confirmar" />
          </dd>
        </div>
        {subscription.plan !== "monthly" && (
          <div className="flex items-baseline justify-between text-muted-foreground">
            <dt>Plazo</dt>
            <dd>{subscription.termMonths === 0 ? "Sin plazo forzoso" : `${subscription.termMonths} meses`}</dd>
          </div>
        )}
        {subscription.plan !== "monthly" && subscription.commitmentCents !== null && subscription.termMonths > subscription.billingMonths && (
          <Row label={`Presupuesto de ${subscription.termMonths} meses`} cents={subscription.commitmentCents} muted />
        )}
      </dl>
      <p className="text-xs text-muted-foreground">
        {subscription.annualCharge
          ? `${subscription.annualCharge.name} (${formatMoney(subscription.annualCharge.cents)} al año) se cobra aparte de la mensualidad: entra en el primer pago y se renueva cada año.`
          : hosting?.upfront
            ? "El hosting se cobra una sola vez, en el primer pago. La mensualidad ya incluye el mantenimiento."
            : hosting
              ? `El hosting se cobra ${every(hosting.billingMonths)}, dentro de cada pago de la suscripción.`
              : providedByClient.length > 0
                ? "Ya cuentas con dominio y hosting: no se cobran."
                : "Este plan no incluye hosting."}{" "}
        {subscription.softwareOnly ? "La renta cubre solo el software y no incluye equipo. " : ""}
        El primer pago suma los cargos de contado{subscription.annualCharge ? `, ${subscription.annualCharge.name.toLowerCase()} del año` : hosting?.upfront ? ", el hosting" : ""} y el primer periodo, por eso puede ser distinto de los siguientes.
      </p>
      {subscription.priceMode === "starting_at" && (
        <p className="text-xs text-muted-foreground">Mensualidad mínima estimada: un asesor la confirmará con los costos de operación.</p>
      )}
      <div>
        <p className="mb-1.5 text-xs font-medium text-foreground-secondary">{subscription.softwareOnly ? "Lo que incluye esta renta" : "La mensualidad incluye"}</p>
        <ul className="grid gap-1 text-sm sm:grid-cols-2">
          {subscription.includes.map((item) => (
            <li key={item} className="flex items-center gap-2 text-foreground-secondary">
              <CircleCheck className="size-3.5 shrink-0 text-electric" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-xs text-muted-foreground">
        ReaperSys conserva la propiedad del sistema; el servicio se mantiene mientras la suscripción esté activa.
        {subscription.softwareOnly ? " La renta cubre solo el software y no incluye equipo." : ""}
        {subscription.hardwareUpfront ? " El equipo físico se paga de contado y es tuyo." : ""}
      </p>
    </section>
  );
}

function Row({ label, cents, muted, pendingLabel }: { label: string; cents: number | null; muted?: boolean; pendingLabel?: string }) {
  return (
    <div className={cn("flex items-baseline justify-between", muted && "text-muted-foreground")}>
      <dt>{label}</dt>
      <dd>
        <Amount cents={cents} pendingLabel={pendingLabel} />
      </dd>
    </div>
  );
}

export function StatusNotice({ calculation }: { calculation: QuoteCalculation }) {
  if (calculation.status === "priced") {
    return (
      <p className="flex items-start gap-2 rounded-lg border border-royal/30 bg-royal/10 px-3 py-2 text-sm text-foreground-secondary">
        <CircleCheck className="mt-0.5 size-4 shrink-0 text-electric" aria-hidden />
        Importes calculados con los precios vigentes.
      </p>
    );
  }
  if (calculation.status === "blocked") {
    return (
      <div role="alert" className="space-y-1 rounded-lg border border-magenta/40 bg-magenta/10 px-3 py-2 text-sm">
        <p className="flex items-center gap-2 font-medium">
          <AlertTriangle className="size-4 shrink-0 text-magenta" aria-hidden /> Hay componentes incompatibles
        </p>
        <ul className="list-disc pl-6 text-foreground-secondary">
          {calculation.blockingIssues.map((issue) => (
            <li key={issue.ruleKey}>{issue.message}</li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div className="space-y-1 rounded-lg border border-border bg-surface-raised/70 px-3 py-2 text-sm">
      <p className="flex items-center gap-2 font-medium">
        <Info className="size-4 shrink-0 text-electric" aria-hidden /> Presupuesto preliminar sujeto a revisión
      </p>
      <ul className="list-disc pl-6 text-foreground-secondary">
        {calculation.reviewReasons.map((reason) => (
          <li key={`${reason.code}-${reason.componentSlug ?? ""}`}>{reason.message}</li>
        ))}
      </ul>
    </div>
  );
}
