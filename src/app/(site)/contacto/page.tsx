import { Mail, MessageCircle, ReceiptText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { ContactForm } from "@/features/contact/contact-form";
import { PageHero } from "@/features/marketing/page-hero";
import { contactLinks, getPublicSettings } from "@/services/public-settings";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Cuéntanos sobre tu negocio y lo que necesitas. Te responderemos con una propuesta.",
  alternates: { canonical: "/contacto" },
};

export default async function ContactPage() {
  const settings = await getPublicSettings();
  const contactInfo = contactLinks(settings);
  return (
    <>
      <PageHero
        eyebrow="Contacto"
        title="Hablemos de tu negocio"
        description="Cuéntanos qué necesitas implementar. Un asesor revisará tu solicitud y te responderá con una propuesta."
        image="/images/backgrounds/testimonials-handshake.webp"
        imagePosition="center 40%"
        variant="strip"
      />
      <Section aria-label="Formulario de contacto" tone="tint" className="pt-14 sm:pt-20">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <Reveal>
            <ContactForm privacyNoticeAvailable={settings.privacyNotice.published} />
          </Reveal>
          <Reveal delay={0.1} className="space-y-5">
            <aside className="bg-shade-band rounded-2xl p-6 text-snow shadow-elevated">
              <ReceiptText className="mb-4 size-6 text-gold-soft" aria-hidden />
              <h2 className="mb-2 font-heading text-lg font-semibold text-snow">¿Ya sabes lo que necesitas?</h2>
              <p className="mb-4 text-sm leading-relaxed text-snow/80">
                Configura tu solución en el cotizador y recibe una cotización formal con folio y desglose.
              </p>
              <Link href="/cotizador" className="text-sm font-medium text-gold-soft hover:underline">
                Ir al cotizador →
              </Link>
            </aside>
            {(contactInfo.email || contactInfo.whatsappUrl) && (
              <aside className="space-y-3 rounded-2xl border border-border bg-card shadow-card p-6">
                <h2 className="font-heading text-lg font-semibold">Contacto directo</h2>
                {contactInfo.whatsappUrl && (
                  <a
                    href={contactInfo.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-foreground-secondary hover:text-foreground"
                  >
                    <MessageCircle className="size-4 text-electric" aria-hidden />
                    Escríbenos por WhatsApp
                  </a>
                )}
                {contactInfo.email && (
                  <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-3 text-sm text-foreground-secondary hover:text-foreground">
                    <Mail className="size-4 text-electric" aria-hidden />
                    {contactInfo.email}
                  </a>
                )}
              </aside>
            )}
          </Reveal>
        </div>
      </Section>
    </>
  );
}
