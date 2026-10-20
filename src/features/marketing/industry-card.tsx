import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { quoteHrefForIndustry, type Industry } from "@/content/industries";

/**
 * Tarjeta de industria. La cabecera es una fotografía representativa del giro (decorativa,
 * con licencia libre: ver docs/IMAGE-CREDITS.md);
 * los ejemplos son soluciones posibles, no implementaciones realizadas.
 * `featured`: versión horizontal (foto grande a un lado) para encabezar una rejilla ocupando dos columnas.
 */
export function IndustryCard({ industry, featured = false }: { industry: Industry; featured?: boolean }) {
  const Icon = industry.icon;

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-royal/30 hover:shadow-elevated motion-reduce:hover:translate-y-0",
        featured && "lg:flex-row",
      )}
    >
      <div className={cn("relative aspect-[16/10] overflow-hidden border-b border-border bg-cloud", featured && "lg:aspect-auto lg:w-[55%] lg:border-r lg:border-b-0")}>
        <Image
          src={`/images/industries/${industry.slug}.jpg`}
          alt=""
          fill
          sizes={featured ? "(min-width: 1024px) 480px, (min-width: 640px) 50vw, 100vw" : "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"}
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy/55 via-navy/10 to-navy/25" />
        <div aria-hidden className="absolute top-4 left-4 inline-flex size-10 items-center justify-center rounded-xl bg-navy text-gold-soft shadow-card">
          <Icon className="size-5" />
        </div>
      </div>

      <div className={cn("flex flex-1 flex-col p-6", featured && "lg:p-8")}>
        {featured && <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-royal uppercase">Giro destacado</p>}
        <h3 className={cn("mb-2 font-heading font-semibold text-navy", featured ? "text-2xl" : "text-lg")}>{industry.name}</h3>
        <p className="mb-4 text-sm leading-relaxed text-foreground-secondary">{industry.description}</p>
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Soluciones posibles</p>
        <ul className="mb-6 flex flex-wrap gap-1.5">
          {industry.solutions.map((solution) => (
            <li key={solution} className="rounded-full border border-border bg-mist px-2.5 py-1 text-xs text-foreground-secondary">
              {solution}
            </li>
          ))}
        </ul>
        <Button asChild variant="glass" className="mt-auto h-10 w-full rounded-xl">
          <Link href={quoteHrefForIndustry(industry.slug)} aria-label={`Configurar solución para ${industry.name}`}>
            Configurar solución
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
