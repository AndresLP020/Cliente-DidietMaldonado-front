"use client";

import { ArrowLeft } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { STEPS, type StepId, useQuoteStore } from "./store";
import { ClientStep } from "./steps/client-step";
import { CustomizeStep } from "./steps/customize-step";
import { IndustryStep } from "./steps/industry-step";
import { PackageStep } from "./steps/package-step";
import { ResultStep } from "./steps/result-step";
import { SolutionStep } from "./steps/solution-step";
import { SummaryStep } from "./steps/summary-step";
import type { SubscriptionPlan } from "@/types/quote";

const SLUG = /^[a-z0-9-]{1,80}$/;

const stepComponents: Record<StepId, () => React.ReactNode> = {
  1: IndustryStep,
  2: SolutionStep,
  3: PackageStep,
  4: CustomizeStep,
  5: SummaryStep,
  6: ClientStep,
  7: ResultStep,
};

function useHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useQuoteStore.persist.onFinishHydration(onChange),
    () => useQuoteStore.persist.hasHydrated(),
    () => false,
  );
}

/** ?plan= en español → plan de la suscripción. */
const PLAN_PARAMS: Record<string, SubscriptionPlan> = { mensual: "monthly", semestral: "semiannual", anual: "annual" };

export function QuoteBuilder() {
  const hydrated = useHydrated();
  const params = useSearchParams();
  const applied = useRef(false);
  const step = useQuoteStore((s) => s.step);
  const goTo = useQuoteStore((s) => s.goTo);

  // Restaura el progreso guardado y aplica los parámetros de entrada (?industria=, ?paquete=, ?modalidad=suscripcion).
  useEffect(() => {
    if (applied.current) return;
    applied.current = true;
    const industria = params.get("industria");
    const paquete = params.get("paquete");
    const modalidad = params.get("modalidad");
    const plan = params.get("plan");
    void Promise.resolve(useQuoteStore.persist.rehydrate()).then(() => {
      const store = useQuoteStore.getState();
      if (paquete && SLUG.test(paquete)) {
        if (store.packageSlug !== paquete) store.choosePackage(paquete);
        if (modalidad === "suscripcion" || modalidad === "compra") store.setPaymentMode(modalidad === "suscripcion" ? "subscription" : "purchase");
        if (plan && PLAN_PARAMS[plan]) store.setSubscriptionPlan(PLAN_PARAMS[plan]);
        if (!store.solution) store.setSolution("unsure");
        store.goTo(4);
      } else if (industria && SLUG.test(industria)) {
        store.setIndustry(industria);
        if (store.step < 2) store.goTo(2);
      }
    });
  }, [params]);

  // Lleva el foco al inicio del paso al cambiar (navegación por teclado y lectores de pantalla).
  const headingRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (hydrated) headingRef.current?.focus({ preventScroll: true });
  }, [step, hydrated]);

  if (!hydrated) {
    return (
      <div className="space-y-6" aria-busy="true">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  const Current = stepComponents[step];
  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <MotionConfig reducedMotion="user">
      <nav aria-label="Progreso del cotizador" className="mb-10">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Paso {step} de {STEPS.length}
          </span>
          <span className="font-medium">{STEPS[step - 1]?.title}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-raised" role="progressbar" aria-label="Progreso del cotizador" aria-valuemin={1} aria-valuemax={7} aria-valuenow={step} aria-valuetext={`Paso ${step} de ${STEPS.length}`}>
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-electric via-royal to-indigo-accent"
            initial={false}
            animate={{ width: `${Math.max(progress, 4)}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 22 }}
          />
        </div>
        <ol className="mt-4 hidden grid-cols-7 gap-2 md:grid">
          {STEPS.map((s) => {
            const reachable = s.id < step && step !== 7;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  disabled={!reachable}
                  onClick={() => goTo(s.id)}
                  aria-current={s.id === step ? "step" : undefined}
                  className={cn(
                    "w-full text-left text-xs transition-colors",
                    s.id === step ? "font-medium text-foreground" : reachable ? "text-foreground-secondary hover:text-foreground" : "text-muted-foreground/60",
                  )}
                >
                  <span className="font-mono">{String(s.id).padStart(2, "0")}</span> {s.title}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {step > 1 && step < 5 && (
        <Button variant="ghost" className="mb-4 -ml-2" onClick={() => goTo((step - 1) as StepId)}>
          <ArrowLeft data-icon="inline-start" /> Atrás
        </Button>
      )}

      <div ref={headingRef} tabIndex={-1} className="outline-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <Current />
          </motion.div>
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
