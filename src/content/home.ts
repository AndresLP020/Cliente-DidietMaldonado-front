import {
  BadgeCheck,
  Blocks,
  FileText,
  Layers,
  MessagesSquare,
  type LucideIcon,
  PackageCheck,
  ReceiptText,
  Rocket,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

export const hero = {
  title: "Tu negocio es único. Tu tecnología también debería serlo.",
  subtitle:
    "Desarrollamos páginas web, tiendas en línea, sistemas de punto de venta y soluciones digitales adaptadas a negocios de cualquier tamaño.",
} as const;

export const intro = {
  eyebrow: "ReaperSys",
  title: "Tecnología personalizada para simplificar, modernizar y crecer.",
  body: [
    "ReaperSys es una empresa especializada en soluciones tecnológicas y digitales para negocios de cualquier tamaño y sector.",
    "Combinamos desarrollo web, comercio electrónico, puntos de venta, software a la medida e integraciones para que tu operación funcione como un solo sistema.",
  ],
} as const;

export interface Step {
  title: string;
  description: string;
  icon: LucideIcon;
}

/** Cómo trabajamos: describe el proceso comercial de la plataforma, sin plazos inventados. */
export const processSteps: Step[] = [
  {
    title: "Diagnóstico",
    description: "Conocemos tu negocio, tu operación actual y lo que necesitas resolver.",
    icon: MessagesSquare,
  },
  {
    title: "Configuración de la solución",
    description: "Eliges un paquete o armas tu solución componente por componente en el cotizador.",
    icon: SlidersHorizontal,
  },
  {
    title: "Cotización formal",
    description: "Recibes una cotización con folio, desglose, condiciones y vigencia.",
    icon: ReceiptText,
  },
  {
    title: "Implementación",
    description: "Desarrollamos, instalamos y configuramos según el alcance acordado.",
    icon: Rocket,
  },
  {
    title: "Soporte",
    description: "Acompañamiento inicial y planes de mantenimiento opcionales.",
    icon: ShieldCheck,
  },
];

export const benefits: Step[] = [
  {
    title: "Pagas por lo que necesitas",
    description: "Agrega o retira componentes opcionales. Lo que ya está incluido en un paquete no se cobra dos veces.",
    icon: PackageCheck,
  },
  {
    title: "Precios transparentes",
    description: "Desglose por componente, costos únicos separados de mensualidades y anticipo claramente indicado.",
    icon: FileText,
  },
  {
    title: "Hardware y software en un solo lugar",
    description: "Equipos, software, presencia web e integraciones con un mismo proveedor.",
    icon: Layers,
  },
  {
    title: "Soluciones que crecen contigo",
    description: "Empieza con lo esencial y amplía con páginas, productos, integraciones o automatizaciones.",
    icon: Blocks,
  },
  {
    title: "Alcance claro",
    description: "Los trabajos que requieren evaluación se identifican como tal, sin presentar precios definitivos que no lo son.",
    icon: BadgeCheck,
  },
];

export const builderTeaser = {
  title: "Arma tu solución a la medida",
  body: "Parte de un paquete o desde cero. Agrega páginas, productos, integraciones, equipo y mantenimiento, retira lo que no necesitas y consulta el presupuesto actualizado antes de solicitar tu cotización.",
  steps: ["Elige tu industria", "Selecciona un paquete", "Personaliza componentes", "Recibe tu cotización"],
} as const;

export interface Faq {
  question: string;
  answer: string;
}

export const faqs: Faq[] = [
  {
    question: "¿Puedo personalizar un paquete?",
    answer:
      "Sí. Puedes agregar componentes, cambiar variantes y retirar elementos opcionales. Los componentes incluidos en el paquete no se cobran de nuevo y, al retirar uno, solo se aplica el crédito de retiro aprobado para ese componente.",
  },
  {
    question: "¿Los precios publicados son definitivos?",
    answer:
      "Los precios de paquetes son importes iniciales sugeridos en MXN. Los conceptos marcados como \"desde\" son mínimos comerciales que requieren evaluación del alcance. La cotización formal con folio es la que establece los importes aplicables.",
  },
  {
    question: "¿El mantenimiento está incluido en el precio?",
    answer:
      "No. Los servicios recurrentes, como mantenimiento, hosting o soporte, se muestran por separado del costo de implementación para que sepas exactamente cuánto pagas una sola vez y cuánto cada mes.",
  },
  {
    question: "¿Cómo se paga una implementación?",
    answer:
      "Como referencia se maneja un anticipo y una liquidación. Los porcentajes y condiciones aplicables se especifican en cada cotización.",
  },
  {
    question: "¿Qué pasa si necesito algo que no está en los paquetes?",
    answer:
      "Puedes solicitar una valoración personalizada desde el cotizador o el formulario de contacto. Revisaremos tu caso y te enviaremos una propuesta con alcance definido.",
  },
  {
    question: "¿Los equipos de punto de venta tienen garantía?",
    answer: "Sí. Las condiciones de garantía aplicables a cada equipo se detallan en la cotización correspondiente.",
  },
  {
    question: "¿La sincronización entre mi tienda en línea y mi POS está incluida?",
    answer:
      "No se incluye automáticamente en los paquetes combinados. Es una integración adicional que requiere revisión técnica previa.",
  },
];
