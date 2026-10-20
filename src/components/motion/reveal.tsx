"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

interface RevealProps extends HTMLMotionProps<"div"> {
  delay?: number;
  /** Desplazamiento vertical inicial en px. */
  y?: number;
  /**
   * false = el contenido es visible desde el primer pintado y solo se desplaza.
   * Úsese en el elemento principal de la página (LCP): un texto con opacidad 0 no cuenta
   * como pintado hasta que termina la animación, lo que retrasa el LCP.
   */
  fade?: boolean;
}

/**
 * Aparición suave al entrar en el viewport. Con `prefers-reduced-motion`
 * el contenido se muestra directamente, sin desplazamiento.
 */
export function Reveal({ delay = 0, y = 24, fade = true, children, ...props }: RevealProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : fade ? { opacity: 0, y } : { y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface StaggerProps extends HTMLMotionProps<"div"> {
  stagger?: number;
}

/** Contenedor que escalona la aparición de sus hijos `StaggerItem`. */
export function Stagger({ stagger = 0.08, children, ...props }: StaggerProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger } } }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
