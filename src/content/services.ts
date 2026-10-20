import {
  Blocks,
  Boxes,
  Cable,
  Code2,
  Cpu,
  LayoutTemplate,
  type LucideIcon,
  MonitorSmartphone,
  Settings2,
  ShoppingBag,
  Store,
  Workflow,
  Wrench,
} from "lucide-react";

export type ServiceSlug =
  | "landing-pages"
  | "sitios-corporativos"
  | "tiendas-virtuales"
  | "punto-de-venta"
  | "equipos-pos"
  | "software-comercial"
  | "software-personalizado"
  | "integraciones"
  | "automatizacion"
  | "hardware-software"
  | "soporte";

export interface Service {
  slug: ServiceSlug;
  name: string;
  summary: string;
  icon: LucideIcon;
  /** Página de detalle, cuando existe. */
  href?: string;
  highlights: string[];
}

/** Servicios principales de ReaperSys (brief, sección 1). */
export const services: Service[] = [
  {
    slug: "landing-pages",
    name: "Landing pages",
    summary: "Páginas enfocadas en presentar tu negocio y convertir visitas en contactos.",
    icon: LayoutTemplate,
    href: "/desarrollo-web",
    highlights: ["Diseño responsive", "Llamados a la acción", "Botones de contacto y redes"],
  },
  {
    slug: "sitios-corporativos",
    name: "Sitios web corporativos",
    summary: "Presencia profesional con páginas internas, servicios e información de tu empresa.",
    icon: MonitorSmartphone,
    href: "/desarrollo-web",
    highlights: ["Páginas internas", "Navegación profesional", "SEO inicial opcional"],
  },
  {
    slug: "tiendas-virtuales",
    name: "Tiendas virtuales",
    summary: "Catálogo, carrito, pedidos y pasarela de pago para vender en línea.",
    icon: ShoppingBag,
    href: "/ecommerce",
    highlights: ["Catálogo y carrito", "Gestión de pedidos", "Pasarelas de pago"],
  },
  {
    slug: "punto-de-venta",
    name: "Sistemas de punto de venta",
    summary: "Implementación de POS para cobrar, controlar inventario y emitir tickets.",
    icon: Store,
    href: "/punto-de-venta",
    highlights: ["Software POS", "Inventario", "Impresión de tickets"],
  },
  {
    slug: "equipos-pos",
    name: "Equipos para punto de venta",
    summary: "Computadoras, monitores, lectores, impresoras térmicas y básculas.",
    icon: Cpu,
    href: "/punto-de-venta",
    highlights: ["Equipo nuevo o reacondicionado", "Lectores de códigos", "Impresoras térmicas"],
  },
  {
    slug: "software-comercial",
    name: "Configuración de software comercial",
    summary: "Instalación y configuración del software que tu operación necesita.",
    icon: Settings2,
    highlights: ["Instalación", "Configuración inicial", "Capacitación de uso"],
  },
  {
    slug: "software-personalizado",
    name: "Software personalizado",
    summary: "Desarrollo a la medida cuando una solución genérica no se adapta a tu proceso.",
    icon: Code2,
    highlights: ["Alcance definido por contrato", "Módulos a la medida", "Escalable"],
  },
  {
    slug: "integraciones",
    name: "Integraciones entre sistemas",
    summary: "Conectamos tu tienda, POS, CRM y herramientas para que compartan información.",
    icon: Cable,
    highlights: ["POS y e-commerce", "CRM", "WhatsApp Business API"],
  },
  {
    slug: "automatizacion",
    name: "Automatización de procesos",
    summary: "Formularios, notificaciones y flujos que reducen tareas manuales repetitivas.",
    icon: Workflow,
    highlights: ["Formularios inteligentes", "Notificaciones", "Chatbots"],
  },
  {
    slug: "hardware-software",
    name: "Soluciones de hardware y software",
    summary: "Paquetes que combinan equipo, software y presencia digital en una sola propuesta.",
    icon: Boxes,
    href: "/paquetes",
    highlights: ["Paquetes combinados", "Un solo proveedor", "Implementación integral"],
  },
  {
    slug: "soporte",
    name: "Mantenimiento y soporte",
    summary: "Planes mensuales para mantener tus sistemas actualizados y funcionando.",
    icon: Wrench,
    highlights: ["Mantenimiento web", "Soporte POS", "Monitoreo de integraciones"],
  },
];

/** Las tres líneas principales que se destacan en la página de inicio. */
export const coreServiceLines = [
  {
    title: "Desarrollo web",
    description: "Landing pages y sitios corporativos con diseño profesional y responsive.",
    href: "/desarrollo-web",
    icon: MonitorSmartphone,
  },
  {
    title: "E-commerce",
    description: "Tiendas virtuales con catálogo, carrito, pedidos y pagos en línea.",
    href: "/ecommerce",
    icon: ShoppingBag,
  },
  {
    title: "Punto de venta",
    description: "Equipos y software POS para cobrar, controlar inventario y vender más ordenado.",
    href: "/punto-de-venta",
    icon: Store,
  },
  {
    title: "Software e integraciones",
    description: "Desarrollo a la medida, automatizaciones y conexión entre tus sistemas.",
    href: "/servicios",
    icon: Blocks,
  },
] as const;
