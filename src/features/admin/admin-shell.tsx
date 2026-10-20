"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  ClipboardList,
  FileSignature,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  type LucideIcon,
  Menu,
  MessageSquareQuote,
  Settings,
  ShieldCheck,
  Tags,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { adminApi, setCsrfToken } from "./admin-api";
import { useSession } from "./session";
import type { Permission } from "./types";
import { roleLabels } from "./ui";

const NAV: { href: string; label: string; icon: LucideIcon; permission: Permission }[] = [
  { href: "/admin", label: "Tablero", icon: LayoutDashboard, permission: "dashboard:read" },
  { href: "/admin/cotizaciones", label: "Cotizaciones", icon: FileText, permission: "quotes:read" },
  { href: "/admin/prospectos", label: "Prospectos", icon: ClipboardList, permission: "leads:read" },
  { href: "/admin/clientes", label: "Clientes", icon: Users, permission: "clients:read" },
  { href: "/admin/cobranza", label: "Cobranza", icon: Wallet, permission: "billing:read" },
  { href: "/admin/contratos", label: "Rentas y compras", icon: FileSignature, permission: "billing:read" },
  { href: "/admin/testimonios", label: "Testimonios", icon: MessageSquareQuote, permission: "testimonials:manage" },
  { href: "/admin/precios", label: "Catálogo y precios", icon: Tags, permission: "catalog:read" },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings, permission: "settings:read" },
  { href: "/admin/usuarios", label: "Usuarios", icon: ShieldCheck, permission: "users:manage" },
  { href: "/admin/auditoria", label: "Auditoría", icon: History, permission: "audit:read" },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useSession();
  return (
    <ul className="space-y-1">
      {NAV.filter((item) => user.permissions.includes(item.permission)).map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-sky text-royal" : "text-foreground-secondary hover:bg-cloud hover:text-foreground",
              )}
            >
              <item.icon className={cn("size-4", active ? "text-royal" : "text-muted-foreground")} aria-hidden />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function UserBox() {
  const { user } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  const logout = async () => {
    setPending(true);
    try {
      await adminApi.send("POST", "/auth/logout");
    } catch {
      // Aunque falle la red, se limpia el estado local y se vuelve al inicio de sesión.
    }
    setCsrfToken(null);
    queryClient.removeQueries({ queryKey: ["admin"] });
    router.replace("/admin/login");
  };

  return (
    <div className="space-y-2 border-t border-border pt-4">
      <Link href="/admin/cuenta" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-cloud">
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-sky text-royal">
          <UserRound className="size-4" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{user.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{roleLabels[user.role]}</span>
        </span>
      </Link>
      <Button variant="ghost" className="w-full justify-start gap-3 px-3 text-foreground-secondary" onClick={logout} disabled={pending}>
        <LogOut className="size-4" aria-hidden /> Cerrar sesión
      </Button>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-svh bg-canvas">
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2">
        Saltar al contenido
      </a>
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r border-border bg-mist px-4 py-6 lg:flex">
        <Link href="/admin" className="mb-8 px-2">
          <Logo />
          <span className="mt-1 block text-xs text-muted-foreground">Panel administrativo</span>
        </Link>
        <nav aria-label="Panel" className="flex-1 overflow-y-auto">
          <NavLinks />
        </nav>
        <UserBox />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur lg:hidden">
          <Link href="/admin">
            <Logo />
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-lg" aria-label="Abrir menú">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-72 flex-col bg-mist px-4">
              <SheetHeader className="px-2">
                <SheetTitle>Panel administrativo</SheetTitle>
                <SheetDescription className="sr-only">Navegación del panel</SheetDescription>
              </SheetHeader>
              <nav aria-label="Panel" className="flex-1">
                <NavLinks onNavigate={() => setOpen(false)} />
              </nav>
              <div className="pb-4">
                <UserBox />
              </div>
            </SheetContent>
          </Sheet>
        </header>
        <main id="admin-main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
