import { ArrowUpRight, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export interface BentoItem {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
  /** Etiquetas breves (p. ej. lo que incluye el servicio). */
  tags?: string[];
}

export interface BentoFeature {
  image: string;
  eyebrow?: string;
  title: string;
  description: string;
  /** Contenido extra al pie de la tarjeta destacada (p. ej. un botón). */
  footer?: React.ReactNode;
}

interface BentoGridProps {
  items: BentoItem[];
  feature: BentoFeature;
  /** Lado de la tarjeta destacada en escritorio. */
  featureSide?: "left" | "right";
  /** Fondo de la sección donde se coloca (ajusta los estilos de las tarjetas pequeñas). */
  surface?: "light" | "dark";
  className?: string;
}

interface TileStyle {
  box: string;
  icon: string;
  title: string;
  text: string;
  arrow: string;
}

/** Estilos que se alternan entre las tarjetas pequeñas para que la rejilla no se vea uniforme. */
const LIGHT_TILES: TileStyle[] = [
  { box: "border border-border bg-card shadow-card", icon: "bg-sky text-royal", title: "text-navy", text: "text-foreground-secondary", arrow: "text-muted-foreground" },
  { box: "bg-navy text-snow shadow-elevated", icon: "border border-gold/40 bg-white/5 text-gold-soft", title: "text-snow", text: "text-snow/80", arrow: "text-snow/70" },
  { box: "border border-sky bg-sky/70", icon: "bg-card text-royal", title: "text-navy", text: "text-slate", arrow: "text-royal" },
  { box: "border border-border bg-cloud", icon: "bg-navy text-gold-soft", title: "text-navy", text: "text-foreground-secondary", arrow: "text-muted-foreground" },
];

const DARK_TILES: TileStyle[] = [
  { box: "glass-dark", icon: "border border-gold/40 bg-white/5 text-gold-soft", title: "text-snow", text: "text-snow/75", arrow: "text-snow/70" },
  { box: "bg-canvas text-foreground shadow-elevated", icon: "bg-sky text-royal", title: "text-navy", text: "text-foreground-secondary", arrow: "text-muted-foreground" },
  { box: "border border-gold/30 bg-gold/10 backdrop-blur", icon: "bg-gold/20 text-gold-soft", title: "text-snow", text: "text-snow/80", arrow: "text-gold-soft" },
  { box: "glass-dark", icon: "bg-white/10 text-snow", title: "text-snow", text: "text-snow/75", arrow: "text-snow/70" },
];

/** Columnas de las tarjetas posteriores a la destacada: la última fila se estira para no dejar huecos. */
function trailingSpan(index: number, total: number): string {
  const rest = total - 4;
  const j = index - 4;
  if (j < 0 || rest <= 0) return "";
  const lastRowStart = rest - (rest % 4 || 4);
  if (j < lastRowStart) return "";
  const inLastRow = rest - lastRowStart;
  if (inLastRow === 1) return "lg:col-span-4";
  if (inLastRow === 2) return "lg:col-span-2";
  if (inLastRow === 3 && j === rest - 1) return "lg:col-span-2";
  return "";
}

/**
 * Rejilla "bento": una tarjeta grande con fotografía bajo sombra neutra y tarjetas pequeñas
 * con superficies alternas. En móvil todo se apila.
 */
export function BentoGrid({ items, feature, featureSide = "left", surface = "light", className }: BentoGridProps) {
  const tiles = surface === "dark" ? DARK_TILES : LIGHT_TILES;
  return (
    <Stagger className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[repeat(2,minmax(13rem,auto))]", className)}>
      <StaggerItem className={cn("sm:col-span-2 lg:row-span-2", featureSide === "right" && "lg:col-start-3 lg:row-start-1")}>
        <div className="on-navy relative isolate flex h-full min-h-80 flex-col justify-end overflow-hidden rounded-3xl p-7 text-snow shadow-elevated sm:p-9">
          <Image src={feature.image} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" quality={70} className="-z-10 object-cover" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-shade/95 via-shade/70 to-shade/25" />
          <div aria-hidden className="absolute top-7 left-7 h-px w-16 bg-gold sm:left-9" />
          {feature.eyebrow && <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-gold-soft uppercase">{feature.eyebrow}</p>}
          <h3 className="font-heading text-2xl font-semibold text-balance text-snow sm:text-3xl">{feature.title}</h3>
          <p className="mt-3 max-w-md leading-relaxed text-snow/85">{feature.description}</p>
          {feature.footer && <div className="mt-6">{feature.footer}</div>}
        </div>
      </StaggerItem>

      {items.map((item, index) => {
        const style = tiles[index % tiles.length]!;
        const wide = trailingSpan(index, items.length);
        const Icon = item.icon;
        const body = (
          <>
            <span className={cn("inline-flex size-11 shrink-0 items-center justify-center rounded-xl", style.icon)}>
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="block">
              <span className={cn("mb-1.5 flex items-start justify-between gap-3 font-heading text-lg font-semibold", style.title)}>
                {item.title}
                {item.href && (
                  <ArrowUpRight
                    aria-hidden
                    className={cn("size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5", style.arrow)}
                  />
                )}
              </span>
              <span className={cn("block text-sm leading-relaxed", style.text)}>{item.description}</span>
              {item.tags && item.tags.length > 0 && (
                <span className={cn("mt-4 flex flex-wrap gap-1.5", style.text)}>
                  {item.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-current/20 px-2.5 py-0.5 text-xs">
                      {tag}
                    </span>
                  ))}
                </span>
              )}
            </span>
          </>
        );
        const classes = cn(
          "group flex h-full flex-col gap-5 rounded-3xl p-6 transition-[transform,box-shadow] duration-300",
          wide === "lg:col-span-4" && "lg:flex-row lg:items-center",
          item.href && "hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
          style.box,
        );
        return (
          <StaggerItem key={item.title} className={wide}>
            {item.href ? (
              <Link href={item.href} className={classes}>
                {body}
              </Link>
            ) : (
              <div className={classes}>{body}</div>
            )}
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
