import {
  CreditCard,
  FileSearch,
  Filter,
  Gauge,
  Images,
  LayoutTemplate,
  type LucideIcon,
  Mail,
  MessageCircle,
  MonitorSmartphone,
  Package,
  Printer,
  Receipt,
  ScanBarcode,
  Scale,
  Search,
  ShoppingCart,
  Tags,
  Truck,
  UserRound,
  Warehouse,
  Wrench,
} from "lucide-react";
import type { PackageCategory } from "@/types/catalog";

export interface ServicePageContent {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  capabilities: { title: string; description: string; icon: LucideIcon }[];
  /** Complementos disponibles (los precios vigentes los provee el cotizador vía API). */
  addOns: string[];
  packageCategories: PackageCategory[];
  considerations: string[];
}

export const webPage: ServicePageContent = {
  slug: "desarrollo-web",
  eyebrow: "Desarrollo web",
  title: "Sitios que presentan tu negocio como se merece",
  description:
    "Landing pages y sitios corporativos responsive, con navegación clara y llamados a la acción que convierten visitas en contactos.",
  metaTitle: "Desarrollo web",
  metaDescription: "Landing pages y sitios web corporativos responsive para negocios de cualquier tamaño.",
  capabilities: [
    { title: "Diseño responsive", description: "Se ve y funciona bien en celulares, tabletas y computadoras.", icon: MonitorSmartphone },
    { title: "Estructura a la medida", description: "Secciones y páginas internas según la información de tu negocio.", icon: LayoutTemplate },
    { title: "Contacto directo", description: "Botones de WhatsApp, redes sociales, correo y formularios.", icon: MessageCircle },
    { title: "Visibilidad en buscadores", description: "SEO inicial opcional para que te encuentren en Google.", icon: Search },
    { title: "Galerías y contenido", description: "Galerías de imágenes y blog administrable como complementos.", icon: Images },
    { title: "Formularios", description: "Formularios de contacto y de cotización conectados a tu correo o CRM.", icon: Mail },
  ],
  addOns: [
    "Sección adicional",
    "Página interna adicional",
    "Galería",
    "SEO inicial",
    "Blog administrable",
    "Diseño visual avanzado",
    "Animaciones avanzadas",
    "Botones de WhatsApp y redes sociales (incluidos en la Web Corporativa)",
    "Formulario de contacto",
    "Formulario de cotización",
    "Widget de WhatsApp",
    "Integración con CRM",
    "Chatbot",
  ],
  packageCategories: ["web"],
  considerations: [
    "El dominio y el hosting se cobran aparte: $500 al año por ambos. Si ya cuentas con alguno, se descuenta.",
    "El mantenimiento mensual es opcional y se muestra aparte del costo de desarrollo.",
  ],
};

export const ecommercePage: ServicePageContent = {
  slug: "ecommerce",
  eyebrow: "E-commerce",
  title: "Tu tienda en línea, lista para vender",
  description:
    "Catálogo, carrito, pedidos y pagos en línea. Desde una tienda para comenzar hasta una operación con variantes, cupones y cuentas de clientes.",
  metaTitle: "Tiendas virtuales",
  metaDescription: "Desarrollo de tiendas en línea con catálogo, carrito, pedidos, pasarelas de pago y envíos.",
  capabilities: [
    { title: "Catálogo de productos", description: "Organiza tus productos con fotos, descripciones y precios.", icon: Package },
    { title: "Carrito y pedidos", description: "Flujo de compra completo y gestión de pedidos.", icon: ShoppingCart },
    { title: "Pagos en línea", description: "Configuración de pasarela de pago; pasarelas adicionales como complemento.", icon: CreditCard },
    { title: "Variantes y filtros", description: "Tallas, colores y filtros para encontrar productos rápido.", icon: Filter },
    { title: "Cupones y cuentas", description: "Cuentas de clientes y cupones de descuento.", icon: Tags },
    { title: "Opciones de envío", description: "Reglas de envío básicas o configuración avanzada.", icon: Truck },
  ],
  addOns: [
    "Pasarela de pago adicional",
    "Configuración avanzada de envíos",
    "Suscripciones",
    "Lista de deseos",
    "Recuperación de carrito",
    "Sistema de reseñas",
    "Reportes personalizados",
    "Sincronización POS / e-commerce",
  ],
  packageCategories: ["ecommerce"],
  considerations: [
    "Las comisiones de las pasarelas de pago las cobra cada proveedor.",
    "La sincronización con un punto de venta requiere revisión técnica previa.",
  ],
};

export const posPage: ServicePageContent = {
  slug: "punto-de-venta",
  eyebrow: "Punto de venta",
  title: "Cobra rápido y controla tu inventario",
  description:
    "Equipos y software de punto de venta listos para operar: computadora, monitor, lector de códigos, impresora de tickets e instalación.",
  metaTitle: "Sistemas de punto de venta",
  metaDescription: "Paquetes POS con equipo, software, lector de códigos e impresora térmica. Opciones nuevas y reacondicionadas.",
  capabilities: [
    { title: "Equipo completo", description: "Computadora, monitor, teclado, mouse y extensión eléctrica.", icon: Gauge },
    { title: "Lector de códigos", description: "Captura de productos rápida y sin errores de tecleo.", icon: ScanBarcode },
    { title: "Impresora de tickets", description: "Impresora térmica; corte automático en paquetes superiores.", icon: Printer },
    { title: "Inventario y ventas", description: "Software de gestión para controlar existencias y ventas.", icon: Warehouse },
    { title: "Báscula opcional", description: "Para negocios que venden a granel.", icon: Scale },
    { title: "Instalación y soporte", description: "Instalación y soporte inicial en paquetes que lo incluyen.", icon: Wrench },
  ],
  addOns: ["Báscula", "Soporte operativo POS mensual", "Sincronización POS / e-commerce", "Software personalizado"],
  packageCategories: ["pos"],
  considerations: [
    "Como referencia se maneja un anticipo y una liquidación; los porcentajes aplicables se indican en la cotización.",
    "Las condiciones de garantía de cada equipo se especifican en la cotización.",
    "La personalización del software tiene un alcance definido por contrato.",
  ],
};

export const aboutValues = [
  {
    title: "Soluciones a la medida",
    description: "Cada negocio opera distinto. Configuramos la tecnología alrededor de tu operación, no al revés.",
    icon: UserRound,
  },
  {
    title: "Transparencia comercial",
    description: "Desglose claro, costos únicos separados de mensualidades y alcances definidos antes de comenzar.",
    icon: Receipt,
  },
  {
    title: "Visión integral",
    description: "Web, tienda en línea, punto de venta e integraciones pensados como un solo sistema.",
    icon: FileSearch,
  },
] as const;
