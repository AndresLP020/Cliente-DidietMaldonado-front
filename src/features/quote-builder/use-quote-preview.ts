"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { quoteApi } from "@/services/quotes";
import { hasSelection, selectionOf, useQuoteStore } from "./store";

function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

/**
 * Presupuesto actualizado en vivo. Cada cambio se envía al backend (con un pequeño retardo)
 * y se muestra el cálculo AUTORITATIVO del servidor; el navegador no calcula importes.
 */
export function useQuotePreview() {
  const state = useQuoteStore(
    useShallow((s) => ({
      packageSlug: s.packageSlug,
      paymentMode: s.paymentMode,
      subscriptionPlan: s.subscriptionPlan,
      variants: s.variants,
      removed: s.removed,
      quantities: s.quantities,
      recurring: s.recurring,
      clientProvided: s.clientProvided,
    })),
  );
  const enabled = hasSelection(state);
  const selection = useMemo(() => selectionOf(state), [state]);
  const debounced = useDebounced(selection, 300);

  return useQuery({
    queryKey: ["quote-preview", debounced],
    queryFn: ({ signal }) => quoteApi.preview(debounced, signal),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    retry: false,
  });
}
