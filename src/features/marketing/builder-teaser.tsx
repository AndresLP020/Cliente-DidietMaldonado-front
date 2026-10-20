import { ArrowRight, Check, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { builderTeaser } from "@/content/home";

/** Ilustración de componentes que se pueden agregar o retirar (sin importes: los precios vienen de la API). */
const illustrativeItems = [
  { label: "Página interna adicional", state: "add" },
  { label: "Botón de WhatsApp", state: "included" },
  { label: "SEO inicial", state: "add" },
  { label: "Báscula", state: "add" },
  { label: "Lector de códigos", state: "included" },
  { label: "Mantenimiento mensual", state: "optional" },
] as const;

/**
 * Composición dividida: fotografía enmarcada con la vista previa del cotizador superpuesta a la izquierda
 * y el texto a la derecha (alterna con la presentación, que lleva la foto a la derecha).
 */
export function BuilderTeaser() {
  return (
    <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
      <Reveal delay={0.1} aria-hidden className="relative order-2 sm:pb-24 lg:order-1 lg:pb-0">
        <div className="absolute -top-4 -left-4 hidden h-2/3 w-2/3 rounded-3xl border border-gold/50 sm:block" />
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-elevated lg:w-[88%]">
          <Image
            src="/images/industries/negocios-sucursales.jpg"
            alt=""
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            quality={70}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-tr from-shade/70 via-shade/20 to-transparent" />
        </div>
        <div className="relative -mt-16 ml-auto w-[92%] rounded-3xl border border-border bg-card p-5 text-foreground shadow-elevated sm:absolute sm:right-0 sm:-bottom-2 sm:mt-0 sm:w-[62%] lg:-right-4 lg:bottom-[-3rem]">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-heading font-semibold text-navy">Tu solución</p>
            <span className="rounded-full bg-sky px-2.5 py-1 text-xs font-medium text-royal">Ejemplo ilustrativo</span>
          </div>
          <ul className="space-y-2">
            {illustrativeItems.map((item) => (
              <li key={item.label} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-mist px-3.5 py-2.5 text-sm">
                <span className="text-foreground-secondary">{item.label}</span>
                {item.state === "included" ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                    <Check className="size-3.5" /> Incluido
                  </span>
                ) : item.state === "optional" ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Minus className="size-3.5" /> Opcional
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-foreground-secondary">
                    <Plus className="size-3.5" /> Agregar
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal className="order-1 space-y-6 lg:order-2">
        <p className="inline-flex items-center gap-2 text-sm font-semibold tracking-[0.14em] text-royal uppercase">
          <span aria-hidden className="h-px w-6 bg-gold" />
          Constructor de soluciones
        </p>
        <h2 className="text-3xl font-semibold text-balance text-navy sm:text-4xl">{builderTeaser.title}</h2>
        <p className="text-lg leading-relaxed text-pretty text-foreground-secondary">{builderTeaser.body}</p>
        <ol className="space-y-3 border-l border-gold/50 pl-6">
          {builderTeaser.steps.map((step, index) => (
            <li key={step} className="relative flex items-center gap-3 text-foreground">
              <span className="absolute -left-[2.15rem] inline-flex size-7 items-center justify-center rounded-full bg-navy font-mono text-xs font-semibold text-gold-soft">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <p className="text-sm text-muted-foreground">El presupuesto se calcula en el servidor con los precios vigentes en cada paso.</p>
        <Button asChild variant="brand" size="xl">
          <Link href="/cotizador">
            Comenzar a configurar
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </Reveal>
    </div>
  );
}
