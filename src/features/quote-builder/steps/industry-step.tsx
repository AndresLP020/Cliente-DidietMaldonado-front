"use client";

import { useQuery } from "@tanstack/react-query";
import { HelpCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { industries as industryContent } from "@/content/industries";
import { quoteApi } from "@/services/quotes";
import { ChoiceCard, StepHeader } from "../controls";
import { useQuoteStore } from "../store";

const iconBySlug = new Map(industryContent.map((i) => [i.slug, i.icon]));

export function IndustryStep() {
  const { industry, setIndustry, goTo } = useQuoteStore();
  const { data, isPending, isError } = useQuery({ queryKey: ["industries"], queryFn: quoteApi.industries });

  const choose = (slug: string) => {
    setIndustry(slug);
    goTo(2);
  };

  return (
    <div>
      <StepHeader
        title="¿Qué tipo de negocio tienes?"
        description="Lo usamos para sugerirte componentes. No modifica los precios y podrás cambiar cualquier selección opcional."
      />
      {isError && <p className="mb-4 text-sm text-destructive">No pudimos cargar las industrias. Puedes continuar con &quot;Otro&quot;.</p>}
      <div role="radiogroup" aria-label="Tipo de negocio" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isPending
          ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
          : data?.map((item) => {
              const Icon = iconBySlug.get(item.slug) ?? HelpCircle;
              return (
                <ChoiceCard key={item.slug} selected={industry === item.slug} onSelect={() => choose(item.slug)}>
                  <Icon className="mb-3 size-6 text-electric" aria-hidden />
                  <span className="font-heading font-semibold">{item.name}</span>
                  {item.description && <span className="mt-1 pr-6 text-sm text-foreground-secondary">{item.description}</span>}
                </ChoiceCard>
              );
            })}
        <ChoiceCard selected={industry === "otro"} onSelect={() => choose("otro")}>
          <HelpCircle className="mb-3 size-6 text-electric" aria-hidden />
          <span className="font-heading font-semibold">Otro</span>
          <span className="mt-1 text-sm text-foreground-secondary">Mi giro no aparece en la lista.</span>
        </ChoiceCard>
      </div>
    </div>
  );
}
