import { cn } from "@/lib/utils";
import { Container } from "./container";
import { Reveal } from "@/components/motion/reveal";

/**
 * Fondo de la sección. El sitio alterna bandas oscuras (fotografía bajo sombra neutra o `dark` sin foto)
 * con superficies claras teñidas; se evita el blanco plano en áreas grandes.
 */
export type SectionTone = "tint" | "tint-alt" | "dark";

const toneClasses: Record<SectionTone, string> = {
  tint: "bg-tint",
  "tint-alt": "bg-tint-alt",
  dark: "on-navy overflow-hidden bg-shade-band text-snow",
};

interface SectionProps extends React.ComponentProps<"section"> {
  containerClassName?: string;
  tone?: SectionTone;
}

export function Section({ className, containerClassName, tone, children, ...props }: SectionProps) {
  return (
    <section className={cn("relative isolate py-20 sm:py-28", tone && toneClasses[tone], className)} {...props}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

interface SectionHeadingProps {
  id?: string;
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  /** Nivel de encabezado: h1 en páginas interiores, h2 en secciones. */
  as?: "h1" | "h2";
  /** "navy": textos claros para bandas oscuras. */
  tone?: "light" | "navy";
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "left",
  className,
  as: Heading = "h2",
  tone = "light",
}: SectionHeadingProps) {
  const navy = tone === "navy";
  return (
    <Reveal
      className={cn(
        "max-w-3xl space-y-4",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "inline-flex items-center gap-2 text-sm font-semibold tracking-[0.14em] uppercase",
            navy ? "text-gold-soft" : "text-royal",
            align === "center" && "justify-center",
          )}
        >
          <span aria-hidden className="h-px w-6 bg-gold" />
          {eyebrow}
        </p>
      )}
      <Heading
        id={id}
        className={cn(
          "font-semibold text-balance",
          navy ? "text-snow" : "text-navy",
          Heading === "h1" ? "text-4xl sm:text-5xl lg:text-6xl" : "text-3xl sm:text-4xl",
        )}
      >
        {title}
      </Heading>
      {description && (
        <p className={cn("text-lg leading-relaxed text-pretty", navy ? "text-snow/80" : "text-foreground-secondary")}>{description}</p>
      )}
    </Reveal>
  );
}
