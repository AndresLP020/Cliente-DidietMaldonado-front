import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Fotografía de fondo decorativa con capa encima para conservar el contraste AA del texto:
 *  - shade:       sombra neutra casi negra (sin tinte azul), pareja en toda la banda (procesos, CTA, encabezados).
 *  - shade-split: la misma sombra, algo más densa del lado del texto y abierta hacia la derecha (hero; en móvil, pareja).
 *  - light:       velo gris azulado para secciones claras con tarjetas blancas (nunca blanco plano).
 * Bajo las sombras la foto se desenfoca ligeramente para que se lea como ambiente y no compita con el texto.
 * El contenedor debe tener `relative isolate` (Section ya lo incluye). Las imágenes viven en /public/images.
 */
export type SectionBackgroundOverlay = "shade" | "shade-split" | "light";

const overlays: Record<SectionBackgroundOverlay, string> = {
  shade:
    "bg-shade/78 before:absolute before:inset-x-0 before:top-0 before:h-32 before:bg-linear-to-b before:from-shade/70 before:to-transparent after:absolute after:inset-x-0 after:bottom-0 after:h-32 after:bg-linear-to-b after:from-transparent after:to-shade/70",
  "shade-split":
    "bg-shade/75 lg:bg-transparent lg:bg-linear-to-r lg:from-shade/82 lg:from-0% lg:via-shade/68 lg:via-50% lg:to-shade/55 after:absolute after:inset-x-0 after:bottom-0 after:h-40 after:bg-linear-to-b after:from-transparent after:to-shade/85",
  light: "bg-linear-to-b from-mist/92 to-cloud/88",
};

const defaultImageClass: Record<SectionBackgroundOverlay, string> = {
  shade: "scale-105 blur-[3px]",
  "shade-split": "scale-105 blur-[3px]",
  light: "",
};

interface SectionBackgroundProps {
  src: string;
  overlay?: SectionBackgroundOverlay;
  /** Solo para la imagen del primer bloque visible (LCP). Las demás se cargan de forma diferida. */
  priority?: boolean;
  /** Punto focal de la fotografía (object-position). */
  position?: string;
  className?: string;
  /** Clases de la fotografía; sustituyen al desenfoque por omisión de cada capa. */
  imageClassName?: string;
}

export function SectionBackground({ src, overlay = "shade", priority = false, position = "center", className, imageClassName }: SectionBackgroundProps) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <Image
        src={src}
        alt=""
        fill
        priority={priority}
        sizes="100vw"
        quality={70}
        className={cn("object-cover", imageClassName ?? defaultImageClass[overlay])}
        style={{ objectPosition: position }}
      />
      <div className={cn("absolute inset-0", overlays[overlay])} />
    </div>
  );
}
