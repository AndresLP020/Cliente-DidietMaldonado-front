"use client";

import { useQuery } from "@tanstack/react-query";
import { Boxes, Code2, HelpCircle, LayoutTemplate, type LucideIcon, MonitorSmartphone, ShoppingBag, Sparkles, Store } from "lucide-react";
import { quoteApi } from "@/services/quotes";
import type { SolutionKind } from "@/types/quote";
import { ChoiceCard, StepHeader } from "../controls";
import { useQuoteStore } from "../store";

const options: { value: SolutionKind; label: string; description: string; icon: LucideIcon }[] = [
  { value: "landing", label: "Landing page", description: "Una página para presentar tu negocio.", icon: LayoutTemplate },
  { value: "web", label: "Web corporativa", description: "Sitio con páginas internas y servicios.", icon: MonitorSmartphone },
  { value: "ecommerce", label: "Tienda virtual", description: "Vende en línea con catálogo y pagos.", icon: ShoppingBag },
  { value: "pos", label: "Punto de venta", description: "Software para cobrar, inventario y tickets.", icon: Store },
  { value: "combo", label: "Solución combinada", description: "Tienda virtual y punto de venta conectados.", icon: Boxes },
  { value: "custom", label: "Software personalizado", description: "Desarrollo a la medida de tu proceso.", icon: Code2 },
  { value: "unsure", label: "Aún no estoy seguro", description: "Muéstrame todas las opciones.", icon: HelpCircle },
];

export function SolutionStep() {
  const { solution, industry, setSolution, goTo } = useQuoteStore();
  const { data: industries } = useQuery({ queryKey: ["industries"], queryFn: quoteApi.industries });
  const suggested = industries?.find((i) => i.slug === industry)?.suggestedSolutions ?? [];

  const choose = (value: SolutionKind) => {
    setSolution(value);
    goTo(3);
  };

  return (
    <div>
      <StepHeader title="¿Qué necesitas implementar?" description="Elige la opción que más se acerque. Podrás ajustarla después." />
      <div role="radiogroup" aria-label="Necesidad" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => (
          <ChoiceCard key={option.value} selected={solution === option.value} onSelect={() => choose(option.value)}>
            <option.icon className="mb-3 size-6 text-electric" aria-hidden />
            <span className="font-heading font-semibold">{option.label}</span>
            <span className="mt-1 pr-6 text-sm text-foreground-secondary">{option.description}</span>
            {suggested.includes(option.value) && (
              <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-royal/15 px-2 py-0.5 text-xs text-electric">
                <Sparkles className="size-3" aria-hidden /> Sugerido para tu negocio
              </span>
            )}
          </ChoiceCard>
        ))}
      </div>
    </div>
  );
}
