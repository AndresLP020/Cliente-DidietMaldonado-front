import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/layout/section";
import { CtaBanner } from "@/features/marketing/cta-banner";
import { PageHero } from "@/features/marketing/page-hero";
import { categoryLabels } from "@/features/packages/package-card";
import { PackageGrid } from "@/features/packages/package-grid";
import type { PackageCategory } from "@/types/catalog";

export const metadata: Metadata = {
  title: "Paquetes",
  description: "Paquetes de desarrollo web, e-commerce, punto de venta y soluciones combinadas. Precios iniciales en MXN.",
  alternates: { canonical: "/paquetes" },
};

const sections: { category: PackageCategory; description: string }[] = [
  { category: "web", description: "Landing pages y sitios corporativos." },
  { category: "ecommerce", description: "Tiendas virtuales para vender en línea." },
  { category: "pos", description: "Software de punto de venta: caja, inventario, tickets y clientes." },
  {
    category: "combo",
    description: "Tienda virtual y punto de venta conectados, con catálogo e inventario compartidos sin costo extra de integración.",
  },
  { category: "custom", description: "Software a la medida o asesoría si aún no sabes qué necesitas." },
];

export default function PackagesPage() {
  return (
    <>
      <PageHero
        eyebrow="Paquetes"
        title="Elige un paquete y hazlo tuyo"
        description="Importes iniciales sugeridos en MXN. Agrega o retira componentes en el cotizador: lo que ya está incluido no se cobra dos veces."
        image="/images/backgrounds/night-offices.webp"
      />
      {sections.map(({ category, description }, index) => (
        <Section
          key={category}
          id={category}
          aria-labelledby={`${category}-title`}
          tone={index % 2 === 1 ? "dark" : "tint"}
          className={index === 0 ? "pt-14 sm:pt-20" : undefined}
        >
          <SectionHeading id={`${category}-title`} title={categoryLabels[category]} description={description} tone={index % 2 === 1 ? "navy" : "light"} />
          <div className="mt-10">
            <PackageGrid category={category} />
          </div>
        </Section>
      ))}
      <CtaBanner
        title="¿Ningún paquete se ajusta a lo que buscas?"
        description="Arma tu solución desde cero en el cotizador o solicita una valoración personalizada."
      />
    </>
  );
}
