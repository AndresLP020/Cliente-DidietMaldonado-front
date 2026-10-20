import { z } from "zod";

/**
 * Validación del formulario de contacto en el cliente (retroalimentación inmediata).
 * El backend vuelve a validar todo; sus reglas son las autoritativas.
 */
export const contactInterests = [
  { value: "landing", label: "Landing page" },
  { value: "web", label: "Web corporativa" },
  { value: "ecommerce", label: "Tienda virtual" },
  { value: "pos", label: "Punto de venta" },
  { value: "combo", label: "Solución combinada" },
  { value: "custom", label: "Software personalizado" },
  { value: "integrations", label: "Integraciones o automatización" },
  { value: "support", label: "Mantenimiento y soporte" },
  { value: "unsure", label: "Aún no estoy seguro" },
] as const;

type Interest = (typeof contactInterests)[number]["value"];
const interestValues = contactInterests.map((item) => item.value) as [Interest, ...Interest[]];

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre.").max(120),
  company: z.string().trim().max(160).optional(),
  email: z.string().trim().pipe(z.email("Escribe un correo electrónico válido.")),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?[\d\s-]{10,20})?$/, "Escribe un teléfono de 10 a 15 dígitos.")
    .optional(),
  industry: z.string().optional(),
  interest: z.enum(interestValues).optional(),
  message: z.string().trim().min(10, "Cuéntanos un poco más (mínimo 10 caracteres).").max(2000),
  consent: z.boolean().refine((value) => value, "Necesitamos tu consentimiento para responderte."),
  website: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

export interface ContactReceipt {
  received: true;
  reference: string;
}
