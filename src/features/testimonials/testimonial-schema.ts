import { z } from "zod";

/** Validación en el cliente; el backend vuelve a validar y sus reglas son las autoritativas. */
export const testimonialSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre.").max(80),
  company: z.string().trim().max(120).optional(),
  role: z.string().trim().max(80).optional(),
  email: z.union([z.literal(""), z.string().trim().pipe(z.email("Escribe un correo electrónico válido."))]).optional(),
  rating: z.number({ error: "Elige una calificación." }).int().min(1, "Elige una calificación.").max(5),
  message: z.string().trim().min(20, "Cuéntanos un poco más (mínimo 20 caracteres).").max(1000, "Máximo 1000 caracteres."),
  consent: z.boolean().refine((value) => value, "Necesitamos tu autorización para publicar tu comentario."),
  website: z.string().optional(),
});

export type TestimonialFormValues = z.infer<typeof testimonialSchema>;
