import { MessageSquareQuote, Quote, Star } from "lucide-react";
import Image from "next/image";
import { Section, SectionHeading } from "@/components/layout/section";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import { getTestimonials } from "@/services/testimonials";
import type { PublicTestimonial } from "@/types/testimonial";
import { TestimonialDialog } from "./testimonial-dialog";

const monthYear = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric", timeZone: "America/Mexico_City" });

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={`${rating} de 5 estrellas`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} aria-hidden className={cn("size-4", i < Math.round(rating) ? "fill-gold text-gold" : "text-soft-gray")} />
      ))}
    </span>
  );
}

function TestimonialCard({ testimonial, highlight }: { testimonial: PublicTestimonial; highlight: boolean }) {
  const subtitle = [testimonial.role, testimonial.company].filter(Boolean).join(" · ");
  return (
    <figure
      className={cn(
        "relative mb-5 break-inside-avoid rounded-2xl p-6",
        highlight ? "bg-navy text-snow shadow-elevated" : "border border-border bg-card shadow-card",
      )}
    >
      <Stars rating={testimonial.rating} />
      <blockquote className={cn("mt-4 leading-relaxed text-pretty", highlight ? "text-lg text-snow/90" : "text-foreground-secondary")}>
        “{testimonial.message}”
      </blockquote>
      <figcaption className={cn("mt-6 flex items-center gap-3 border-t pt-5", highlight ? "border-white/15" : "border-border")}>
        <span
          aria-hidden
          className={cn(
            "inline-flex size-10 shrink-0 items-center justify-center rounded-full font-heading text-sm font-semibold",
            highlight ? "border border-gold/60 text-gold-soft" : "bg-navy text-snow",
          )}
        >
          {initials(testimonial.name)}
        </span>
        <span className="min-w-0">
          <span className={cn("block truncate font-semibold", highlight ? "text-snow" : "text-navy")}>{testimonial.name}</span>
          {subtitle && <span className={cn("block truncate text-sm", highlight ? "text-snow/75" : "text-muted-foreground")}>{subtitle}</span>}
          <span className={cn("block text-xs", highlight ? "text-snow/70" : "text-muted-foreground")}>{monthYear.format(new Date(testimonial.createdAt))}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * "Lo que dicen nuestros clientes": solo comentarios reales aprobados en el panel; nunca de ejemplo.
 * Composición propia: gran comilla dorada, columnas tipo mampostería y una franja fotográfica difuminada al borde.
 */
export async function TestimonialsSection({ className }: { className?: string }) {
  const result = await getTestimonials();
  const data = result.status === "ok" ? result.data : null;
  const items = data?.items ?? [];

  return (
    <Section aria-labelledby="testimonials-title" tone="tint-alt" className={cn("overflow-hidden", className)}>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-[38%] lg:block">
        <Image src="/images/backgrounds/testimonials-handshake.webp" alt="" fill sizes="40vw" quality={60} className="object-cover blur-[2px]" />
        <div className="absolute inset-0 bg-linear-to-r from-cloud via-cloud/85 to-cloud/30" />
      </div>
      <Quote aria-hidden className="pointer-events-none absolute top-14 right-[4%] -z-10 hidden size-56 text-gold/30 lg:block" strokeWidth={1} />

      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.6fr] lg:gap-16">
        <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            id="testimonials-title"
            eyebrow="Testimonios"
            title="Lo que dicen nuestros clientes"
            description="Opiniones de negocios que confiaron en nosotros, publicadas tras una revisión."
          />
          {data && data.average !== null && data.count > 0 && (
            <Reveal className="inline-flex items-center gap-4 rounded-2xl bg-navy px-5 py-4 text-snow shadow-elevated">
              <span className="font-heading text-4xl font-semibold text-gold-soft">
                {data.average.toLocaleString("es-MX", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}
              </span>
              <span>
                <Stars rating={data.average} />
                <span className="mt-1 block text-sm text-snow/80">
                  {data.count} {data.count === 1 ? "opinión" : "opiniones"}
                </span>
              </span>
            </Reveal>
          )}
          <Reveal>
            <TestimonialDialog />
          </Reveal>
        </div>

        {items.length > 0 ? (
          <Stagger className="columns-1 gap-5 md:columns-2">
            {items.map((testimonial, index) => (
              <StaggerItem key={testimonial.id}>
                <TestimonialCard testimonial={testimonial} highlight={index === 0} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <Reveal className="relative flex flex-col items-start gap-4 self-center rounded-3xl border border-border bg-card/90 p-8 shadow-elevated backdrop-blur sm:p-10">
            <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-navy text-gold-soft">
              <MessageSquareQuote className="size-7" aria-hidden />
            </span>
            <h3 className="font-heading text-2xl font-semibold text-navy">Sé el primero en compartir tu experiencia</h3>
            <p className="max-w-lg text-foreground-secondary">
              Si ya implementaste una solución con ReaperSys, cuéntanos cómo te fue. Publicamos los comentarios después de revisarlos.
            </p>
          </Reveal>
        )}
      </div>
    </Section>
  );
}
