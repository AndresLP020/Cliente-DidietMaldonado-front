import { ArrowUpRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
  items?: string[];
  className?: string;
  /** "dark": vidrio oscuro para bandas oscuras. */
  tone?: "light" | "dark";
}

/** Tarjeta premium con icono, borde luminoso al pasar el cursor y enlace opcional. */
export function FeatureCard({ icon: Icon, title, description, href, items, className, tone = "light" }: FeatureCardProps) {
  const dark = tone === "dark";
  const content = (
    <>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100",
          dark ? "bg-gradient-to-r from-gold-soft to-gold" : "bg-gradient-to-r from-royal to-indigo-accent",
        )}
      />
      <div className={cn("mb-5 inline-flex size-11 items-center justify-center rounded-xl", dark ? "border border-gold/40 bg-white/5 text-gold-soft" : "bg-sky text-royal")}>
        <Icon className="size-5" aria-hidden />
      </div>
      <h3 className={cn("mb-2 flex items-start justify-between gap-3 font-heading text-lg font-semibold", dark && "text-snow")}>
        {title}
        {href && (
          <ArrowUpRight
            className={cn(
              "size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
              dark ? "text-snow/60 group-hover:text-gold-soft" : "text-muted-foreground group-hover:text-electric",
            )}
            aria-hidden
          />
        )}
      </h3>
      <p className={cn("text-sm leading-relaxed", dark ? "text-snow/75" : "text-foreground-secondary")}>{description}</p>
      {items && items.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {items.map((item) => (
            <li
              key={item}
              className={cn("rounded-full border px-2.5 py-1 text-xs", dark ? "border-white/15 bg-white/5 text-snow/80" : "border-border bg-mist text-foreground-secondary")}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </>
  );

  const classes = cn(
    "group relative block h-full overflow-hidden rounded-2xl p-6 transition-[border-color,transform,box-shadow,background-color] duration-300",
    dark ? "glass-dark hover:border-gold/40 hover:bg-white/10" : "border border-border bg-card shadow-card hover:border-royal/30 hover:shadow-elevated",
    href && "hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
    className,
  );

  return href ? (
    <Link href={href} className={classes}>
      {content}
    </Link>
  ) : (
    <div className={classes}>{content}</div>
  );
}
