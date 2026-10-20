"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { PackageCategory } from "@/types/catalog";
import type { CreateQuoteResult, PaymentMode, QuoteSelection, SolutionKind, SubscriptionPlan } from "@/types/quote";

export const STEPS = [
  { id: 1, title: "Tu negocio" },
  { id: 2, title: "Necesidad" },
  { id: 3, title: "Paquete" },
  { id: 4, title: "Personalizar" },
  { id: 5, title: "Resumen" },
  { id: 6, title: "Tus datos" },
  { id: 7, title: "Cotización" },
] as const;
export type StepId = (typeof STEPS)[number]["id"];

/** Categorías de paquete que se muestran según la necesidad elegida. */
export const SOLUTION_CATEGORIES: Record<SolutionKind, PackageCategory[]> = {
  landing: ["web"],
  web: ["web"],
  ecommerce: ["ecommerce"],
  pos: ["pos"],
  combo: ["combo"],
  custom: ["custom"],
  unsure: ["web", "ecommerce", "pos", "combo", "custom"],
};

interface QuoteBuilderState {
  step: StepId;
  industry: string | null;
  solution: SolutionKind | null;
  /** null + fromScratch = solución desde cero. */
  packageSlug: string | null;
  fromScratch: boolean;
  /** Comprar el sistema o rentarlo por mensualidad. */
  paymentMode: PaymentMode;
  subscriptionPlan: SubscriptionPlan;
  variants: Record<string, string>;
  removed: string[];
  /** Cantidad TOTAL deseada por componente de pago único. */
  quantities: Record<string, number>;
  recurring: string[];
  /** Dominio u hosting con los que el cliente ya cuenta (se descuentan). */
  clientProvided: string[];
  /** Resultado de la solicitud (no se persiste: contiene el token de acceso). */
  result: CreateQuoteResult | null;

  goTo: (step: StepId) => void;
  setIndustry: (slug: string) => void;
  setSolution: (solution: SolutionKind) => void;
  choosePackage: (slug: string | null) => void;
  setPaymentMode: (mode: PaymentMode) => void;
  setSubscriptionPlan: (plan: SubscriptionPlan) => void;
  setVariant: (groupKey: string, optionKey: string) => void;
  toggleRemoved: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  toggleRecurring: (slug: string, exclusiveWith?: string[]) => void;
  toggleClientProvided: (slug: string) => void;
  setResult: (result: CreateQuoteResult) => void;
  reset: () => void;
}

const initial = {
  step: 1 as StepId,
  industry: null,
  solution: null,
  packageSlug: null,
  fromScratch: false,
  paymentMode: "purchase" as PaymentMode,
  subscriptionPlan: "monthly" as SubscriptionPlan,
  variants: {},
  removed: [],
  quantities: {},
  recurring: [],
  clientProvided: [],
  result: null,
};

export const useQuoteStore = create<QuoteBuilderState>()(
  persist(
    (set) => ({
      ...initial,
      goTo: (step) => set({ step }),
      setIndustry: (industry) => set({ industry }),
      setSolution: (solution) => set({ solution }),
      // Cambiar de paquete reinicia la personalización: las cantidades incluidas dependen del paquete.
      choosePackage: (slug) =>
        set((s) => ({
          packageSlug: slug,
          fromScratch: slug === null,
          // Desde cero no hay suscripción: requiere un paquete.
          paymentMode: slug === null ? "purchase" : s.paymentMode,
          variants: {},
          removed: [],
          quantities: {},
          recurring: [],
        })),
      // Los servicios incluidos cambian con la modalidad: se reinicia la elección de recurrentes.
      setPaymentMode: (paymentMode) => set((s) => (s.paymentMode === paymentMode ? {} : { paymentMode, recurring: [] })),
      setSubscriptionPlan: (subscriptionPlan) => set({ subscriptionPlan }),
      setVariant: (groupKey, optionKey) => set((s) => ({ variants: { ...s.variants, [groupKey]: optionKey } })),
      toggleRemoved: (slug) =>
        set((s) => ({ removed: s.removed.includes(slug) ? s.removed.filter((r) => r !== slug) : [...s.removed, slug] })),
      setQuantity: (slug, quantity) =>
        set((s) => {
          const quantities = { ...s.quantities };
          if (quantity <= 0) delete quantities[slug];
          else quantities[slug] = quantity;
          return { quantities };
        }),
      toggleRecurring: (slug, exclusiveWith = []) =>
        set((s) =>
          s.recurring.includes(slug)
            ? { recurring: s.recurring.filter((r) => r !== slug) }
            : { recurring: [...s.recurring.filter((r) => !exclusiveWith.includes(r)), slug] },
        ),
      // No depende del paquete: si el cliente ya tiene dominio u hosting, sigue igual al cambiar de paquete.
      toggleClientProvided: (slug) =>
        set((s) => ({
          clientProvided: s.clientProvided.includes(slug) ? s.clientProvided.filter((c) => c !== slug) : [...s.clientProvided, slug],
        })),
      setResult: (result) => set({ result, step: 7 }),
      reset: () => set({ ...initial }),
    }),
    {
      name: "reapersys-quote-builder",
      storage: createJSONStorage(() => sessionStorage),
      // La hidratación se dispara manualmente tras el montaje para evitar desajustes con el HTML del servidor.
      skipHydration: true,
      // Se persisten solo los campos de la selección (nunca el resultado con el token de acceso).
      partialize: (s) => ({
        step: s.step === 7 ? 1 : s.step,
        industry: s.industry,
        solution: s.solution,
        packageSlug: s.packageSlug,
        fromScratch: s.fromScratch,
        paymentMode: s.paymentMode,
        subscriptionPlan: s.subscriptionPlan,
        variants: s.variants,
        removed: s.removed,
        quantities: s.quantities,
        recurring: s.recurring,
        clientProvided: s.clientProvided,
      }),
    },
  ),
);

/** Selección que se envía al backend (fuente única de los cálculos). */
export function selectionOf(
  state: Pick<
    QuoteBuilderState,
    "packageSlug" | "paymentMode" | "subscriptionPlan" | "variants" | "removed" | "quantities" | "recurring" | "clientProvided"
  >,
): QuoteSelection {
  const subscribing = state.packageSlug !== null && state.paymentMode === "subscription";
  return {
    paymentMode: subscribing ? "subscription" : "purchase",
    ...(subscribing ? { subscriptionPlan: state.subscriptionPlan } : {}),
    packageSlug: state.packageSlug,
    variants: state.variants,
    removedComponents: state.removed,
    components: Object.entries(state.quantities).map(([slug, quantity]) => ({ slug, quantity })),
    recurring: state.recurring,
    // Sin paquete no se cobran dominio ni hosting.
    clientProvided: state.packageSlug === null ? [] : state.clientProvided,
  };
}

/** Dominio y hosting: van con todo paquete ($500 al año por ambos) y se descuentan si el cliente ya los tiene. */
export const INFRASTRUCTURE_SLUGS = ["hosting-annual", "domain-annual"];

export function hasSelection(state: Pick<QuoteBuilderState, "packageSlug" | "quantities" | "recurring">): boolean {
  return state.packageSlug !== null || Object.keys(state.quantities).length > 0 || state.recurring.length > 0;
}
