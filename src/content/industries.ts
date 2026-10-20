import {
  Building2,
  Coffee,
  Hammer,
  type LucideIcon,
  Pill,
  Scissors,
  Shirt,
  ShoppingBasket,
  Stethoscope,
  Briefcase,
} from "lucide-react";

/** Tipo de solución que el cotizador puede sugerir; nunca altera precios por sí mismo. */
export type SolutionKind = "landing" | "web" | "ecommerce" | "pos" | "combo" | "custom";

export interface Industry {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  /** Ejemplos de soluciones posibles (no implementaciones realizadas). */
  solutions: string[];
  /** Punto de partida sugerido para el cotizador. El cliente puede cambiarlo. */
  suggestedSolutions: SolutionKind[];
}

export const industries: Industry[] = [
  {
    slug: "tiendas-abarrotes",
    name: "Tiendas y abarrotes",
    description: "Cobro ágil, control de existencias y tickets en cada venta.",
    icon: ShoppingBasket,
    solutions: ["Punto de venta", "Inventario", "Lectores de códigos", "Impresión de tickets"],
    suggestedSolutions: ["pos"],
  },
  {
    slug: "restaurantes-cafeterias",
    name: "Restaurantes y cafeterías",
    description: "Pedidos, menú digital y control de ventas en un solo flujo.",
    icon: Coffee,
    solutions: ["Gestión de pedidos", "Menús digitales", "Control de ventas", "Sistemas POS compatibles"],
    suggestedSolutions: ["pos", "landing"],
  },
  {
    slug: "boutiques",
    name: "Boutiques",
    description: "Vende en línea con catálogo, tallas, colores e inventario.",
    icon: Shirt,
    solutions: ["Tienda virtual", "Catálogo", "Variantes", "Inventario"],
    suggestedSolutions: ["ecommerce"],
  },
  {
    slug: "barberias-salones",
    name: "Barberías y salones",
    description: "Presencia web, reservaciones y contacto directo por WhatsApp.",
    icon: Scissors,
    solutions: ["Página web", "Reservaciones", "Formularios", "WhatsApp"],
    suggestedSolutions: ["landing", "web"],
  },
  {
    slug: "farmacias",
    name: "Farmacias",
    description: "Venta de productos con control de existencias adecuado al giro.",
    icon: Pill,
    solutions: ["Inventario", "Venta de productos", "Control de existencias", "POS adecuado al giro"],
    suggestedSolutions: ["pos"],
  },
  {
    slug: "ferreterias-papelerias",
    name: "Ferreterías y papelerías",
    description: "Catálogos amplios de productos con inventario y reportes.",
    icon: Hammer,
    solutions: ["Punto de venta", "Productos", "Inventario", "Reportes"],
    suggestedSolutions: ["pos"],
  },
  {
    slug: "consultorios",
    name: "Consultorios",
    description: "Sitio profesional con formularios y agendamiento de citas.",
    icon: Stethoscope,
    solutions: ["Página corporativa", "Formularios", "Agendamiento", "Gestión de contacto"],
    suggestedSolutions: ["web"],
  },
  {
    slug: "empresas-servicios",
    name: "Empresas de servicios",
    description: "Sitio corporativo, CRM y automatizaciones para captar clientes.",
    icon: Briefcase,
    solutions: ["Sitios corporativos", "CRM", "Formularios", "Automatizaciones"],
    suggestedSolutions: ["web", "custom"],
  },
  {
    slug: "negocios-sucursales",
    name: "Negocios con sucursales",
    description: "Gestión comercial e integraciones entre puntos de venta.",
    icon: Building2,
    solutions: ["Gestión comercial", "Software personalizado", "Punto de venta", "Integraciones"],
    suggestedSolutions: ["combo", "custom"],
  },
];

export function quoteHrefForIndustry(slug: string): string {
  return `/cotizador?industria=${encodeURIComponent(slug)}`;
}
