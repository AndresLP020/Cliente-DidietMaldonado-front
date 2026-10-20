"use client";

import { ArrowRight, LockKeyhole, Menu } from "lucide-react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { primaryNav, serviceNav } from "@/content/navigation";
import { cn } from "@/lib/utils";

function isActive(pathname: string | null, href: string): boolean {
  if (pathname === null) return false;
  if (href === "/") return pathname === "/";
  if (href === "/servicios") {
    return pathname === href || serviceNav.some((item) => item.href === pathname);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Navbar fija: transparente sobre las bandas navy de encabezado y blanca al hacer scroll (estilos en globals.css).
 * usePathname() es dato de la solicitud en rutas dinámicas (Cache Components): se resuelve
 * dentro de Suspense y, mientras tanto, se muestra la misma navbar sin enlace activo.
 */
export function SiteHeader() {
  return (
    <Suspense fallback={<SiteHeaderView pathname={null} />}>
      <SiteHeaderWithPath />
    </Suspense>
  );
}

function SiteHeaderWithPath() {
  return <SiteHeaderView pathname={usePathname()} />;
}

function SiteHeaderView({ pathname }: { pathname: string | null }) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  // "Cotizador" se presenta como CTA destacado; no se repite en la lista de enlaces.
  const links = primaryNav.filter((item) => item.href !== "/cotizador");

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Saltar al contenido
      </a>
      <motion.div
        data-scrolled={scrolled}
        className="site-header-bar border-b transition-[background-color,border-color,box-shadow] duration-300"
      >
        <nav aria-label="Principal" className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="ReaperSys, inicio" className="shrink-0 rounded-md">
            <Logo />
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active ? "text-[var(--hdr-fg)]" : "text-[var(--hdr-muted)] hover:text-[var(--hdr-fg)]",
                    )}
                  >
                    {item.label}
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-[var(--hdr-accent)]"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            {/* Acceso discreto al panel administrativo (la sesión se valida en /admin). */}
            <Button
              asChild
              variant="ghost"
              className="hidden h-10 gap-2 rounded-xl border border-[color-mix(in_oklab,var(--hdr-fg)_22%,transparent)] px-3 text-[var(--hdr-fg)] hover:bg-[color-mix(in_oklab,var(--hdr-fg)_10%,transparent)] hover:text-[var(--hdr-fg)] sm:inline-flex"
            >
              <Link href="/admin" aria-label="Acceso administrativo">
                <LockKeyhole className="size-4" aria-hidden />
                <span className="hidden xl:inline">Administración</span>
              </Link>
            </Button>
            <Button asChild variant="brand" className="hidden h-10 rounded-xl px-4 sm:inline-flex">
              <Link href="/cotizador">
                Cotizar ahora
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon-lg" className="text-[var(--hdr-fg)] hover:bg-[color-mix(in_oklab,var(--hdr-fg)_10%,transparent)] hover:text-[var(--hdr-fg)] lg:hidden" aria-label="Abrir menú">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm border-border bg-canvas">
                <SheetHeader>
                  <SheetTitle>
                    <Logo />
                  </SheetTitle>
                  <SheetDescription className="sr-only">Navegación del sitio</SheetDescription>
                </SheetHeader>
                <ul className="flex flex-col gap-1 px-4">
                  {primaryNav.map((item) => {
                    const active = isActive(pathname, item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "block rounded-lg px-3 py-3 text-base font-medium transition-colors",
                            active ? "bg-sky text-navy" : "text-foreground-secondary hover:bg-mist",
                          )}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-auto space-y-2 p-4">
                  <Button asChild variant="outline" size="xl" className="w-full">
                    <Link href="/admin" onClick={() => setOpen(false)}>
                      <LockKeyhole data-icon="inline-start" />
                      Acceso administrativo
                    </Link>
                  </Button>
                  <Button asChild variant="brand" size="xl" className="w-full">
                    <Link href="/cotizador" onClick={() => setOpen(false)}>
                      Cotizar ahora
                      <ArrowRight data-icon="inline-end" />
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </motion.div>
    </header>
  );
}
