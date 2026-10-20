"use client";

import { Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import type { PaymentMode, SubscriptionPlan, SubscriptionPlanOption } from "@/types/quote";

/** Selector numérico accesible (− valor +). */
export function QuantityStepper({
  value,
  min,
  max,
  onChange,
  label,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-canvas" role="group" aria-label={label}>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Disminuir ${label}`}
      >
        <Minus />
      </Button>
      <input
        type="number"
        inputMode="numeric"
        className="w-12 [appearance:textfield] bg-transparent text-center text-sm tabular-nums outline-none [&::-webkit-inner-spin-button]:appearance-none"
        value={value}
        min={min}
        max={max}
        aria-label={label}
        onChange={(event) => {
          const next = Number.parseInt(event.target.value, 10);
          if (Number.isFinite(next)) onChange(Math.min(max, Math.max(min, next)));
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Aumentar ${label}`}
      >
        <Plus />
      </Button>
    </div>
  );
}

/** Tarjeta seleccionable (radio/checkbox visual) con estado accesible. */
export function ChoiceCard({
  selected,
  onSelect,
  children,
  className,
  role = "radio",
}: {
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
  className?: string;
  role?: "radio" | "checkbox";
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "group relative flex h-full w-full flex-col rounded-2xl border bg-card p-5 text-left transition-[border-color,background-color,transform] duration-200",
        "hover:-translate-y-0.5 hover:border-royal/40 hover:shadow-card motion-reduce:hover:translate-y-0",
        selected ? "border-royal bg-sky/60 shadow-card ring-1 ring-royal/30" : "border-border",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-4 right-4 inline-flex size-5 items-center justify-center rounded-full border transition-colors",
          selected ? "border-royal bg-royal text-primary-foreground" : "border-border",
        )}
      >
        {selected && <Check className="size-3" />}
      </span>
      {children}
    </button>
  );
}

/** Alterna entre comprar el sistema o rentarlo por mensualidad. */
export function PaymentModeToggle({
  value,
  onChange,
  className,
}: {
  value: PaymentMode;
  onChange: (mode: PaymentMode) => void;
  className?: string;
}) {
  const options: { mode: PaymentMode; title: string; hint: string }[] = [
    { mode: "purchase", title: "Comprar", hint: "Pago único; el sistema es tuyo" },
    { mode: "subscription", title: "Rentar mensual", hint: "Solo software, sin equipo · soporte incluido · dominio y hosting al año" },
  ];
  return (
    <div role="radiogroup" aria-label="Modalidad de pago" className={cn("grid gap-2 rounded-2xl border border-border bg-card shadow-card p-1.5 sm:grid-cols-2", className)}>
      {options.map((option) => (
        <button
          key={option.mode}
          type="button"
          role="radio"
          aria-checked={value === option.mode}
          onClick={() => onChange(option.mode)}
          className={cn(
            "rounded-xl px-4 py-2.5 text-left transition-colors",
            value === option.mode ? "bg-royal/15 ring-1 ring-royal" : "hover:bg-surface-raised/70",
          )}
        >
          <span className="block text-sm font-semibold">{option.title}</span>
          <span className="block text-xs text-muted-foreground">{option.hint}</span>
        </button>
      ))}
    </div>
  );
}

/** Planes de la suscripción. El presupuesto de cada uno usa su plazo oficial. */
export function PlanPicker({
  plans,
  value,
  onChange,
}: {
  plans: SubscriptionPlanOption[];
  value: SubscriptionPlan;
  onChange: (plan: SubscriptionPlan) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Plan de la suscripción" className="grid gap-2 sm:grid-cols-3">
      {plans.map((p) => {
        const savings = p.savingsVsMonthlyCents ?? null;
        const budget = p.budgetCents ?? (p.billingMonths === p.termMonths && p.termMonths > 1 ? p.paymentCents : null);
        return (
          <button
            key={p.plan}
            type="button"
            role="radio"
            aria-checked={value === p.plan}
            onClick={() => onChange(p.plan)}
            className={cn(
              "flex flex-col rounded-xl border px-3 py-2.5 text-left transition-colors",
              value === p.plan ? "border-royal bg-royal/15" : "border-border bg-card hover:border-electric/40",
            )}
          >
            <span className="text-sm font-semibold">{p.label}</span>
            <span className="mt-1 font-heading text-lg font-semibold tabular-nums">
              {p.monthlyCents === null ? "Por confirmar" : formatMoney(p.monthlyCents)}
              {p.monthlyCents !== null && <span className="text-xs font-normal text-muted-foreground"> / mes</span>}
            </span>
            {p.plan !== "monthly" && (
              <span className="text-xs text-muted-foreground">
                {`Plazo de ${p.termMonths} meses`}
                {p.billingMonths > 1 ? ` · cada ${p.billingMonths} meses` : ""}
              </span>
            )}
            {p.plan !== "monthly" && budget !== null && p.termMonths > 0 && (
              <span className="text-xs text-muted-foreground">Presupuesto de {p.termMonths} meses: {formatMoney(budget)}</span>
            )}
            {savings !== null && savings !== 0 && (
              <span className="text-xs font-medium text-electric">
                {savings > 0
                  ? `Ahorras ${formatMoney(savings)} frente al mensual en ${p.termMonths} meses`
                  : `${formatMoney(-savings)} más al mes que el plan mensual`}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function StepHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="mb-8 space-y-2">
      <h2 className="text-2xl font-semibold text-balance sm:text-3xl">{title}</h2>
      {description && <p className="max-w-2xl text-foreground-secondary">{description}</p>}
    </header>
  );
}
