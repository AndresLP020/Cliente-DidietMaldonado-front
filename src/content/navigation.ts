export interface NavItem {
  label: string;
  href: string;
  description?: string;
}

export const primaryNav: NavItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Servicios", href: "/servicios" },
  { label: "Industrias", href: "/industrias" },
  { label: "Paquetes", href: "/paquetes" },
  { label: "Cotizador", href: "/cotizador" },
  { label: "Contacto", href: "/contacto" },
];

export const serviceNav: NavItem[] = [
  { label: "Desarrollo web", href: "/desarrollo-web", description: "Landing pages y sitios corporativos." },
  { label: "E-commerce", href: "/ecommerce", description: "Tiendas virtuales listas para vender." },
  { label: "Punto de venta", href: "/punto-de-venta", description: "Equipos y software POS." },
  { label: "Todos los servicios", href: "/servicios", description: "Software, integraciones y soporte." },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Soluciones",
    items: [
      { label: "Desarrollo web", href: "/desarrollo-web" },
      { label: "E-commerce", href: "/ecommerce" },
      { label: "Punto de venta", href: "/punto-de-venta" },
      { label: "Paquetes", href: "/paquetes" },
    ],
  },
  {
    title: "Empresa",
    items: [
      { label: "Nosotros", href: "/nosotros" },
      { label: "Servicios", href: "/servicios" },
      { label: "Industrias", href: "/industrias" },
      { label: "Contacto", href: "/contacto" },
    ],
  },
  {
    title: "Comenzar",
    items: [
      { label: "Cotizador", href: "/cotizador" },
      { label: "Solicitar asesoría", href: "/contacto" },
    ],
  },
];
