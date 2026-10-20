import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { publicEnv } from "@/lib/env";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_SITE_URL),
  title: {
    default: "ReaperSys — Tecnología a la medida de tu negocio",
    template: "%s | ReaperSys",
  },
  description:
    "Desarrollamos páginas web, tiendas en línea, sistemas de punto de venta y soluciones digitales adaptadas a negocios de cualquier tamaño.",
  applicationName: "ReaperSys",
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "ReaperSys",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff", // = --rs-canvas (src/styles/tokens.css); la API de metadata exige un literal.
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-MX"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
