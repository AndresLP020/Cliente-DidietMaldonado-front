"use client";

import { motion, useReducedMotion } from "motion/react";
import { processSteps } from "@/content/home";

/**
 * Línea de proceso horizontal (vertical en móvil) para una banda oscura: numerales grandes
 * en dorado con contorno, una línea que los une y la aparición escalonada de cada paso.
 */
export function ProcessTimeline() {
  const reduce = useReducedMotion();

  return (
    <ol className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
      <div aria-hidden className="absolute top-[2.6rem] right-[10%] left-[10%] hidden h-px bg-gradient-to-r from-gold/0 via-gold/60 to-gold/0 lg:block" />
      {processSteps.map((step, index) => {
        const Icon = step.icon;
        return (
          <motion.li
            key={step.title}
            className="relative"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.6, delay: reduce ? 0 : index * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-4 lg:flex-col lg:items-start">
              <span aria-hidden className="text-outline-gold font-heading text-6xl leading-none font-bold lg:text-7xl">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="relative inline-flex size-11 items-center justify-center rounded-full border border-gold/60 bg-shade text-gold-soft shadow-elevated">
                <Icon className="size-5" aria-hidden />
              </span>
            </div>
            <p className="sr-only">Paso {index + 1}</p>
            <h3 className="mt-5 mb-2 font-heading text-xl font-semibold text-snow">{step.title}</h3>
            <p className="text-sm leading-relaxed text-snow/80">{step.description}</p>
          </motion.li>
        );
      })}
    </ol>
  );
}
