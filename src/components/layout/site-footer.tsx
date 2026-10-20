import { Mail, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { footerNav } from "@/content/navigation";
import { contactLinks, getPublicSettings } from "@/services/public-settings";
import { Container } from "./container";

export async function SiteFooter() {
  const settings = await getPublicSettings();
  const contactInfo = contactLinks(settings);
  const hasContact = Boolean(contactInfo.email || contactInfo.whatsappUrl || contactInfo.social.length);

  return (
    <footer className="on-navy relative bg-shade-band text-snow">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent"
      />
      <Container className="grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-snow/75">
            Tecnología personalizada para simplificar operaciones, modernizar empresas y facilitar su crecimiento.
          </p>
          {hasContact && (
            <ul className="space-y-2 text-sm">
              {contactInfo.email && (
                <li>
                  <a href={`mailto:${contactInfo.email}`} className="inline-flex items-center gap-2 text-snow/80 hover:text-snow">
                    <Mail className="size-4" aria-hidden />
                    {contactInfo.email}
                  </a>
                </li>
              )}
              {contactInfo.whatsappUrl && (
                <li>
                  <a
                    href={contactInfo.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-snow/80 hover:text-snow"
                  >
                    <MessageCircle className="size-4" aria-hidden />
                    WhatsApp
                  </a>
                </li>
              )}
              {contactInfo.social.map((item) => (
                <li key={item.label}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-snow/80 hover:text-snow">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {footerNav.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="mb-4 font-heading text-sm font-semibold tracking-[0.14em] text-gold-soft uppercase">{group.title}</h2>
            <ul className="space-y-2.5 text-sm">
              {group.items.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-snow/75 transition-colors hover:text-snow">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
      <Container className="flex flex-col gap-2 border-t border-snow/10 py-6 text-xs text-snow/65 sm:flex-row sm:justify-between">
        <p>
          © {settings.tradeName}. Todos los derechos reservados.
          {settings.privacyNotice.published && (
            <>
              {" · "}
              <Link href="/aviso-de-privacidad" className="underline underline-offset-2 hover:text-snow">
                Aviso de privacidad
              </Link>
            </>
          )}
          {" · "}
          <Link href="/admin" className="underline underline-offset-2 hover:text-snow">
            Acceso administrativo
          </Link>
        </p>
        <p>Precios en MXN. Los importes publicados son referencias iniciales; la cotización formal establece las condiciones.</p>
      </Container>
    </footer>
  );
}
