import type { Metadata } from "next";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { LoginForm } from "@/features/admin/login-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <main className="relative isolate flex min-h-svh items-center justify-center bg-mist px-4 py-16">
      <div aria-hidden className="bg-grid absolute inset-0 -z-10 opacity-60" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,color-mix(in_oklab,var(--rs-royal)_12%,transparent),transparent_70%)]" />
      <div className="w-full max-w-sm space-y-8 rounded-2xl border border-border bg-canvas p-8 shadow-elevated">
        <div className="flex flex-col items-center gap-2 text-center">
          <Logo />
          <h1 className="text-xl font-semibold">Panel administrativo</h1>
          <p className="text-sm text-muted-foreground">Acceso exclusivo para el equipo de ReaperSys.</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
