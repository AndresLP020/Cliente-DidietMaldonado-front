import type { Metadata } from "next";
import { ecommercePage } from "@/content/service-pages";
import { ServiceDetail } from "@/features/marketing/service-detail";

export const metadata: Metadata = {
  title: ecommercePage.metaTitle,
  description: ecommercePage.metaDescription,
  alternates: { canonical: "/ecommerce" },
};

export default function Page() {
  return <ServiceDetail content={ecommercePage} image="/images/backgrounds/ecommerce-shopper.webp" imagePosition="70% center" variant="split" featureImage="/images/industries/boutiques.jpg" />;
}
