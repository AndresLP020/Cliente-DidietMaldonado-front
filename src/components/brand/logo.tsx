import { cn } from "@/lib/utils";

/**
 * Logotipo provisional (marca geométrica + wordmark).
 * El logotipo definitivo será configurable desde /admin/configuracion (Fase 5).
 * Sobre fondos navy, el contenedor define --logo-fg, --logo-accent y --logo-hex (ver globals.css).
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <defs>
        <linearGradient id="rs-logo-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--rs-royal)" />
          <stop offset="100%" stopColor="var(--rs-indigo)" />
        </linearGradient>
      </defs>
      <path d="M16 2 29 9.5v13L16 30 3 22.5v-13Z" fill="none" strokeWidth="2" style={{ stroke: "var(--logo-hex, url(#rs-logo-gradient))" }} />
      <path
        d="M11 22V10h6.2a3.8 3.8 0 0 1 0 7.6H11m6.2 0L21.5 22"
        fill="none"
        style={{ stroke: "var(--logo-fg, var(--rs-navy))" }}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-heading text-lg font-semibold tracking-tight text-[var(--logo-fg,var(--rs-navy))]">
        Reaper<span className="text-[var(--logo-accent,var(--rs-royal))]">Sys</span>
      </span>
    </span>
  );
}
